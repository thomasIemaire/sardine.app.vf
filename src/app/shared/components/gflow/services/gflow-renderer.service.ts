import { Injectable, NgZone } from '@angular/core';
import { GflowViewportService, Point } from './gflow-viewport.service';
import { GflowStateService } from './gflow-state.service';
import { GFlowNode, PortKind, PortRef } from '../core/gflow.types';

// ============================================================================
// Types
// ============================================================================

export interface PendingLink {
    from: PortRef;
    mouse: Point;
}

type Direction = 'N' | 'S' | 'E' | 'W';

interface RouteResult {
    d: string;
    mid: Point;
}

// ============================================================================
// Constants
// ============================================================================

const WIRE_GAP = 4;
const NODE_WIDTH = 220;
const NODE_BASE_HEIGHT = 80;
const NODE_ROW_HEIGHT = 44;

const PORT_CLASS_MAP: Record<PortKind, string> = {
    out: 'output',
    in: 'input',
    entry: 'entry',
    exit: 'exit',
};

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class GflowRendererService {
    private viewport: HTMLElement | null = null;
    private rafId: number | null = null;
    private onRendered: (() => void) | null = null;

    private pendingLink: PendingLink | null = null;
    private pendingPreviewD = '';

    constructor(
        private readonly zone: NgZone,
        private readonly viewportService: GflowViewportService,
        private readonly state: GflowStateService,
    ) {}

    get previewPath(): string {
        return this.pendingPreviewD;
    }

    initialize(viewport: HTMLElement, onRendered: () => void): void {
        this.viewport = viewport;
        this.viewportService.setViewport(viewport);
        this.onRendered = onRendered;
        this.schedule();
    }

    dispose(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    schedule(): void {
        if (this.rafId !== null) return;

        this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.zone.runOutsideAngular(() => this.recalculate());
            this.zone.run(() => this.onRendered?.());
        });
    }

    updatePendingLink(link: PendingLink | null): void {
        this.pendingLink = link;
        this.schedule();
    }

    // ========================================================================
    // Private - Main calculation
    // ========================================================================

    private recalculate(): void {
        const stub = this.viewportService.baseStep;

        // Recalculate all existing links
        for (const link of this.state.links) {
            let p1 = this.getPortCenterWorld(link.src);
            let p2 = this.getPortCenterWorld(link.dst);

            if (link.relation === 'entry-exit') {
                p1 = this.applyGap(p1, 'S');
                p2 = this.applyGap(p2, 'N');
                const route = this.calculateRoute(p1, p2, 'S', 'N', stub);
                link.d = route.d;
                link.mid = route.mid;
            } else {
                p1 = this.applyGap(p1, 'E');
                p2 = this.applyGap(p2, 'W');
                const route = this.calculateRoute(p1, p2, 'E', 'W', stub);
                link.d = route.d;
                link.mid = route.mid;
            }
        }

        // Recalculate pending link preview
        this.pendingPreviewD = this.calculatePendingLinkPath(stub);
    }

    private calculatePendingLinkPath(stub: number): string {
        if (!this.pendingLink) return '';

        let p1 = this.getPortCenterWorld(this.pendingLink.from);
        const p2 = this.pendingLink.mouse;
        const kind = this.pendingLink.from.kind;
        const isVertical = kind === 'entry' || kind === 'exit';

        if (isVertical) {
            const startDir: Direction = kind === 'entry' ? 'S' : 'N';
            const endDir: Direction = kind === 'entry' ? 'N' : 'S';
            p1 = this.applyGap(p1, startDir);
            return this.calculateRoute(p1, p2, startDir, endDir, stub).d;
        } else {
            const startDir: Direction = kind === 'out' ? 'E' : 'W';
            const endDir: Direction = kind === 'out' ? 'W' : 'E';
            p1 = this.applyGap(p1, startDir);
            return this.calculateRoute(p1, p2, startDir, endDir, stub).d;
        }
    }

    // ========================================================================
    // Private - Port position calculation
    // ========================================================================

    private getPortCenterWorld(ref: PortRef): Point {
        // Try to get position from DOM element first
        const domPosition = this.getPortPositionFromDOM(ref);
        if (domPosition) return domPosition;

        // Fallback to calculated position
        return this.calculatePortPosition(ref);
    }

    private getPortPositionFromDOM(ref: PortRef): Point | null {
        const cls = PORT_CLASS_MAP[ref.kind];
        const selector = `[data-node-id="${ref.nodeId}"] .${cls}-port[data-index="${ref.portIndex}"]`;
        const el = this.viewport?.querySelector(selector) as HTMLElement | null;

        if (!el) return null;

        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;

        const screenX = rect.left + rect.width / 2;
        const screenY = rect.top + rect.height / 2;
        return this.viewportService.toWorld(screenX, screenY);
    }

    private calculatePortPosition(ref: PortRef): Point {
        const node = this.state.nodes.find(n => n.id === ref.nodeId);
        if (!node) return { x: 0, y: 0 };

        const w = this.getNodeWidth(node);
        const h = this.getNodeHeight(node);

        const portCount = this.getPortCount(node, ref.kind);
        const portIndex = Math.min(ref.portIndex, Math.max(0, portCount - 1));
        const gap = h / (portCount + 1);
        const y = node.y + gap * (portIndex + 1);

        switch (ref.kind) {
            case 'in':
                return { x: node.x, y };
            case 'out':
                return { x: node.x + w, y };
            case 'entry':
                return { x: node.x + w / 2, y: node.y };
            case 'exit':
                return { x: node.x + w / 2, y: node.y + h };
        }
    }

    private getPortCount(node: GFlowNode, kind: PortKind): number {
        switch (kind) {
            case 'in':
                return node.inputs?.length || 1;
            case 'out':
                return node.outputs?.length || 1;
            case 'entry':
                return node.entries?.length || 1;
            case 'exit':
                return node.exits?.length || 1;
        }
    }

    // ========================================================================
    // Private - Node dimensions
    // ========================================================================

    private getNodeWidth(_node: GFlowNode): number {
        return NODE_WIDTH;
    }

    private getNodeHeight(node: GFlowNode): number {
        const namedOutputs = node.outputs?.filter(o => !!o?.name).length ?? 0;
        return namedOutputs > 0 ? 60 + namedOutputs * NODE_ROW_HEIGHT + 10 : NODE_BASE_HEIGHT;
    }

    // ========================================================================
    // Private - Bezier curve calculation
    // ========================================================================

    private calculateRoute(
        start: Point,
        end: Point,
        startDir: Direction,
        endDir: Direction,
        stub: number,
    ): RouteResult {
        const pA = this.offsetPoint(start, startDir, stub);
        const pB = this.offsetPoint(end, endDir, stub);

        const dist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
        const elasticity = Math.max(stub * 2, dist * 0.5);

        const c1 = this.calculateControlPoint(pA, startDir, elasticity);
        const c2 = this.calculateControlPoint(pB, endDir, elasticity);

        const d = `M ${start.x} ${start.y} L ${pA.x} ${pA.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${pB.x} ${pB.y} L ${end.x} ${end.y}`;
        const mid = this.calculateBezierMidpoint(pA, c1, c2, pB);

        return { d, mid };
    }

    private calculateControlPoint(p: Point, dir: Direction, offset: number): Point {
        switch (dir) {
            case 'E':
                return { x: p.x + offset, y: p.y };
            case 'W':
                return { x: p.x - offset, y: p.y };
            case 'S':
                return { x: p.x, y: p.y + offset };
            case 'N':
                return { x: p.x, y: p.y - offset };
        }
    }

    private calculateBezierMidpoint(p0: Point, p1: Point, p2: Point, p3: Point): Point {
        const t = 0.5;
        const u = 1 - t;

        return {
            x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
            y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
        };
    }

    // ========================================================================
    // Private - Geometry helpers
    // ========================================================================

    private applyGap(p: Point, dir: Direction): Point {
        switch (dir) {
            case 'E':
                return { x: p.x + WIRE_GAP, y: p.y };
            case 'W':
                return { x: p.x - WIRE_GAP, y: p.y };
            case 'S':
                return { x: p.x, y: p.y + WIRE_GAP };
            case 'N':
                return { x: p.x, y: p.y - WIRE_GAP };
        }
    }

    private offsetPoint(p: Point, dir: Direction, distance: number): Point {
        switch (dir) {
            case 'E':
                return { x: p.x + distance, y: p.y };
            case 'W':
                return { x: p.x - distance, y: p.y };
            case 'N':
                return { x: p.x, y: p.y - distance };
            case 'S':
                return { x: p.x, y: p.y + distance };
        }
    }
}

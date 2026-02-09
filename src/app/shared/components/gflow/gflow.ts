import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AutoFocus } from 'primeng/autofocus';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { GflowNodeComponent } from './gflow-node/gflow-node';
import { GflowConfigPanelComponent } from './shared/gflow-config-panel/gflow-config-panel';
import { GflowViewportService } from './services/gflow-viewport.service';
import { GflowStateService } from './services/gflow-state.service';
import { GflowRendererService, PendingLink } from './services/gflow-renderer.service';
import { GFlowLink, GFlowNode, JsonValue, NodeType, PortKind, PortRef, FlowData } from './core/gflow.types';
import { PaletteGroup, PaletteItem, PALETTE_GROUPS, NODE_DEFINITION_MAP } from './core/node-definitions';

// ============================================================================
// Constants
// ============================================================================

const SNAP_THRESHOLD_PX = 48;
const CLICK_TO_DRAG_THRESHOLD_PX = 3;
const NODE_WIDTH = 220;
const NODE_BASE_HEIGHT = 80;
const NODE_ROW_HEIGHT = 44;

// ============================================================================
// Types
// ============================================================================

type ToolType = 'select' | 'pan';

interface DragState {
    active: boolean;
    node: GFlowNode | null;
    startX: number;
    startY: number;
    dx: number;
    dy: number;
    group: Array<{ node: GFlowNode; x0: number; y0: number }>;
}

interface PanState {
    active: boolean;
    startX: number;
    startY: number;
    moved: boolean;
}

interface SelectionState {
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    style: { left: string; top: string; width: string; height: string };
}

interface SnappedPort {
    element: HTMLElement;
    ref: PortRef;
    center: { x: number; y: number };
}

export interface FlowSavePayload {
    name: string;
    description: string;
    data: FlowData;
}

// ============================================================================
// Component
// ============================================================================

@Component({
    selector: 'app-gflow',
    imports: [
        CommonModule,
        FormsModule,
        GflowNodeComponent,
        GflowConfigPanelComponent,
        ButtonModule,
        InputTextModule,
        ConfirmDialogModule,
        ToastModule,
        AutoFocus,
    ],
    templateUrl: './gflow.html',
    styleUrls: ['./gflow.scss'],
    providers: [
        GflowViewportService,
        GflowStateService,
        GflowRendererService,
        ConfirmationService,
        MessageService,
    ],
})
export class GflowComponent implements OnInit, AfterViewInit, OnDestroy {
    // ========================================================================
    // ViewChildren
    // ========================================================================

    private readonly viewportRef = viewChild.required<ElementRef<HTMLElement>>('viewport');
    private readonly titleInputRef = viewChild<ElementRef<HTMLInputElement>>('titleInput');

    // ========================================================================
    // Inputs & Outputs
    // ========================================================================

    readonly navigateBack = input<string | null>(null);
    readonly saveFlow = output<FlowSavePayload>();
    readonly close = output<void>();

    // ========================================================================
    // State
    // ========================================================================

    readonly flow = signal({
        title: 'Nouveau Flow',
        description: '',
        id: null as string | null,
    });

    readonly isDirty = signal(false);
    readonly paletteOpen = signal(true);
    readonly configOpen = signal(false);
    readonly currentTool = signal<ToolType>('pan');
    readonly isEditingTitle = signal(false);

    focusedNode: GFlowNode | null = null;
    focusedLink: GFlowLink | null = null;
    focusedInputMap: JsonValue | null = null;

    worldDragging = false;
    pendingLink: PendingLink | null = null;

    dragState: DragState = this.createBlankDragState();
    panState: PanState = { active: false, moved: false, startX: 0, startY: 0 };
    selectionState: SelectionState = this.createBlankSelectionState();

    // ========================================================================
    // Constants exposed to template
    // ========================================================================

    readonly paletteGroups: PaletteGroup[] = PALETTE_GROUPS;
    readonly paletteWidth = 200;

    // ========================================================================
    // Private state
    // ========================================================================

    private skipNextClick = false;
    private snappedPort: SnappedPort | null = null;
    private shouldCenterOnStart = false;

    // ========================================================================
    // Constructor
    // ========================================================================

    constructor(
        private readonly cdr: ChangeDetectorRef,
        public readonly viewport: GflowViewportService,
        public readonly state: GflowStateService,
        private readonly renderer: GflowRendererService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
    ) {}

    // ========================================================================
    // Getters for template bindings
    // ========================================================================

    get links(): GFlowLink[] {
        return this.state.links;
    }

    get nodes(): GFlowNode[] {
        return this.state.nodes;
    }

    get ox(): number {
        return this.viewport.ox;
    }

    get oy(): number {
        return this.viewport.oy;
    }

    get scale(): number {
        return this.viewport.scale;
    }

    get baseStep(): number {
        return this.viewport.baseStep;
    }

    get dotR(): number {
        return this.viewport.baseDot;
    }

    get nodeSize(): number {
        return this.viewport.nodeSize;
    }

    get pendingPreviewD(): string {
        return this.renderer.previewPath;
    }

    get canUndo(): boolean {
        return false;
    }

    get canRedo(): boolean {
        return false;
    }

    // ========================================================================
    // Lifecycle
    // ========================================================================

    ngOnInit(): void {
        this.state.addNode('start', 0, 0);
        this.shouldCenterOnStart = true;
    }

    ngAfterViewInit(): void {
        this.renderer.initialize(this.viewportRef().nativeElement, () => this.cdr.markForCheck());
        this.refreshFocusedInputMap();
        this.renderer.schedule();
        this.updateCursor();

        if (this.shouldCenterOnStart) {
            this.centerOnStartNode();
        }
    }

    ngOnDestroy(): void {
        this.renderer.dispose();
    }

    // ========================================================================
    // Keyboard handlers
    // ========================================================================

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        if (event.key === 'Delete') {
            this.onDeleteFromPanel();
        }
    }

    // ========================================================================
    // Public methods
    // ========================================================================

    loadFlow(flowData: {
        title: string;
        description?: string;
        id?: string;
        nodes?: GFlowNode[];
        links?: GFlowLink[];
        viewport?: { x: number; y: number; scale: number };
    }): void {
        this.flow.set({
            title: flowData.title || 'Nouveau Flow',
            description: flowData.description || '',
            id: flowData.id || null,
        });

        if (flowData.nodes) {
            this.state.nodes = flowData.nodes.map(n => {
                const definition = NODE_DEFINITION_MAP[n.type];
                const configComponent = definition?.create().configComponent || null;

                return {
                    ...n,
                    inputs: n.inputs || [],
                    outputs: n.outputs || [],
                    entries: n.entries || [],
                    exits: n.exits || [],
                    config: n.config || {},
                    selected: false,
                    focused: false,
                    x: Number(n.x),
                    y: Number(n.y),
                    configComponent,
                };
            });
        }

        if (flowData.links) {
            this.state.links = flowData.links;
        }

        if (flowData.viewport) {
            this.viewport.ox = Number(flowData.viewport.x);
            this.viewport.oy = Number(flowData.viewport.y);
            this.viewport.scale = Number(flowData.viewport.scale);
        }

        if (!this.state.hasStart()) {
            this.state.addNode('start', 0, 0);
            this.shouldCenterOnStart = true;
        }

        if (this.shouldCenterOnStart) {
            this.centerOnStartNode();
        }

        this.renderer.schedule();
        this.isDirty.set(false);
        this.cdr.markForCheck();
    }

    onSave(): void {
        const flowState = this.flow();
        const payload: FlowSavePayload = {
            name: flowState.title,
            description: flowState.description || '',
            data: {
                nodes: this.state.nodes,
                links: this.state.links,
                viewport: {
                    x: this.viewport.ox,
                    y: this.viewport.oy,
                    scale: this.viewport.scale,
                },
            },
        };

        this.saveFlow.emit(payload);
        this.isDirty.set(false);
    }

    onClose(): void {
        this.close.emit();
    }

    setTool(tool: ToolType): void {
        this.currentTool.set(tool);
        this.updateCursor();
    }

    undo(): void {
        this.afterGraphChange();
    }

    redo(): void {
        this.afterGraphChange();
    }

    // ========================================================================
    // Title editing
    // ========================================================================

    startEditingTitle(event: MouseEvent): void {
        event.stopPropagation();
        this.isEditingTitle.set(true);
        this.cdr.detectChanges();
        const input = this.titleInputRef()?.nativeElement;
        if (input) {
            input.focus();
            input.select();
        }
    }

    stopEditingTitle(): void {
        if (!this.isEditingTitle()) return;
        this.isEditingTitle.set(false);
        this.isDirty.set(true);
    }

    onTitleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.titleInputRef()?.nativeElement.blur();
        }
    }

    updateFlowTitle(title: string): void {
        this.flow.update(f => ({ ...f, title }));
    }

    // ========================================================================
    // Viewport events
    // ========================================================================

    onWheel(event: WheelEvent): void {
        this.viewport.applyWheel(event);
        this.renderer.schedule();
    }

    onViewportMouseDown(ev: MouseEvent): void {
        this.skipNextClick = false;

        if (ev.button !== 0) return;
        if (this.dragState.active || this.pendingLink) return;
        if (this.isPortElement(ev.target as HTMLElement)) return;

        if (this.currentTool() === 'pan') {
            this.beginPan(ev);
        } else {
            this.beginSelection(ev);
        }
    }

    onViewportClick(): void {
        if (this.skipNextClick) {
            this.skipNextClick = false;
            return;
        }
        this.closeConfig();
        this.deselectAll();
    }

    onMouseMove(ev: MouseEvent): void {
        if (this.panState.active && (ev.buttons & 1)) {
            this.updatePan(ev);
        }
    }

    onDocMouseMove(ev: MouseEvent): void {
        if (this.dragState.active && this.dragState.node) {
            this.updateDrag(ev);
            return;
        }

        if (this.pendingLink) {
            this.updatePendingLink(ev);
        }

        if (this.selectionState.active) {
            this.updateSelection(ev);
        }
    }

    onDocMouseUp(ev: MouseEvent): void {
        if (this.panState.active) this.endPan();
        if (this.dragState.active && this.dragState.node) this.endDrag();
        if (this.pendingLink) this.endLink(ev);
        if (this.selectionState.active) this.endSelection();
        this.renderer.schedule();
    }

    onDocMouseDown(ev: MouseEvent): void {
        const target = ev.target as HTMLElement;
        const portEl = target?.closest('.input-port, .output-port, .entry-port, .exit-port') as HTMLElement | null;
        if (!portEl) return;

        ev.preventDefault();
        ev.stopPropagation();
        this.skipNextClick = true;

        const host = portEl.closest('[data-node-id]') as HTMLElement;
        const nodeId = host.getAttribute('data-node-id')!;
        const portIndex = Number(portEl.getAttribute('data-index') || 0);
        const kind = this.getPortKind(portEl);

        const world = this.viewport.toWorld(ev.clientX, ev.clientY);
        this.pendingLink = { from: { nodeId, portIndex, kind }, mouse: world };
        this.renderer.updatePendingLink(this.pendingLink);
    }

    // ========================================================================
    // Node drag
    // ========================================================================

    startDrag(ev: MouseEvent, node: GFlowNode): void {
        if (this.isPortElement(ev.target as HTMLElement)) return;
        ev.preventDefault();
        ev.stopPropagation();

        if (!node.selected) {
            this.deselectAll();
            node.selected = true;
        }
        this.focusNode(node);

        const world = this.viewport.toWorld(ev.clientX, ev.clientY);
        this.dragState = {
            active: true,
            node,
            startX: node.x,
            startY: node.y,
            dx: world.x - node.x,
            dy: world.y - node.y,
            group: [],
        };

        this.nodes.forEach(other => {
            if (other.selected && other.id !== node.id) {
                this.dragState.group.push({ node: other, x0: other.x, y0: other.y });
            }
        });
    }

    // ========================================================================
    // Palette
    // ========================================================================

    togglePalette(ev?: MouseEvent): void {
        ev?.stopPropagation();
        this.paletteOpen.update(v => !v);
    }

    addFromPalette(item: PaletteItem): void {
        const rect = this.viewportRef().nativeElement.getBoundingClientRect();
        const vx = this.paletteOpen() ? this.paletteWidth + 80 : rect.width * 0.5;
        const vy = rect.height * 0.5;
        const w = this.viewport.toWorld(rect.left + vx, rect.top + vy);
        this.addNodeAt(item.type, w.x, w.y);
    }

    onPaletteDragStart(ev: DragEvent, item: PaletteItem): void {
        ev.dataTransfer?.setData('application/x-node', JSON.stringify(item));
        if (ev.dataTransfer) {
            ev.dataTransfer.effectAllowed = 'copy';
        }
    }

    onWorldDragOver(ev: DragEvent): void {
        if (ev.dataTransfer?.types?.includes('application/x-node')) {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'copy';
        }
    }

    onWorldDrop(event: DragEvent): void {
        const raw = event.dataTransfer?.getData('application/x-node');
        if (!raw) return;
        event.preventDefault();

        const item: PaletteItem = JSON.parse(raw);
        const world = this.viewport.toWorld(event.clientX, event.clientY);
        const hitLink = this.findLinkAt(world.x, world.y);

        if (hitLink) {
            this.splitLinkWithNode(hitLink, item.type, world.x, world.y);
        } else {
            this.addNodeAt(item.type, world.x, world.y);
        }
    }

    // ========================================================================
    // Link interactions
    // ========================================================================

    onLinkClick(event: MouseEvent, link: GFlowLink): void {
        event.stopPropagation();
        this.focusLink(link);
    }

    // ========================================================================
    // Node focus and config
    // ========================================================================

    focusNode(node: GFlowNode | null): void {
        this.focusedNode = node;
        this.focusedLink = null;
        this.nodes.forEach(n => (n.focused = n.id === node?.id));
        this.refreshFocusedInputMap();
        this.cdr.markForCheck();
    }

    focusLink(link: GFlowLink | null): void {
        this.focusedLink = link;
        this.focusedNode = null;
        this.nodes.forEach(n => {
            n.focused = false;
            n.selected = false;
        });
        if (link) this.openConfig();
        this.cdr.markForCheck();
    }

    centerNode(node: GFlowNode): void {
        this.focusNode(node);
        this.openConfig();
        this.renderer.schedule();
    }

    openConfig(): void {
        this.configOpen.set(true);
        this.refreshFocusedInputMap();
    }

    closeConfig(): void {
        this.configOpen.set(false);
        this.focusNode(null);
        this.focusLink(null);
    }

    onNodeConfigChange(_evt: unknown): void {
        if (!this.focusedNode) return;
        this.state.recomputeDownstreamFrom(this.focusedNode.id);
        this.cdr.detectChanges();
        this.afterGraphChange();
    }

    onDeleteFromPanel(): void {
        const nodesToDelete = this.nodes.filter(n => n.selected || n.id === this.focusedNode?.id);
        const linkToDelete = this.focusedLink;

        const deletableNodes = nodesToDelete.filter(n => n.type !== 'start');
        const startNodeSelected = nodesToDelete.some(n => n.type === 'start');

        if (deletableNodes.length === 0 && !linkToDelete) {
            if (startNodeSelected) {
                this.showWarning('Le noeud de départ ne peut pas être supprimé.');
            }
            return;
        }

        const message =
            deletableNodes.length > 0
                ? `Voulez-vous vraiment supprimer ${deletableNodes.length > 1 ? 'ces éléments' : 'ce noeud'} ?`
                : 'Voulez-vous supprimer ce lien ?';

        this.confirmationService.confirm({
            message,
            header: 'Confirmation de suppression',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-sm p-button-text',
            rejectButtonStyleClass: 'p-button-secondary p-button-sm p-button-text',
            accept: () => this.performDeletion(deletableNodes, linkToDelete),
        });
    }

    // ========================================================================
    // Node visibility helpers
    // ========================================================================

    exitHidden(node: GFlowNode): boolean {
        return (
            node.type === 'agent' &&
            this.links.some(
                l =>
                    (l.src.nodeId === node.id && ['out', 'in'].includes(l.src.kind)) ||
                    (l.dst.nodeId === node.id && ['out', 'in'].includes(l.dst.kind)),
            )
        );
    }

    ioHidden(node: GFlowNode): boolean {
        return (
            node.type === 'agent' &&
            this.links.some(
                l =>
                    (l.src.nodeId === node.id && l.src.kind === 'exit') ||
                    (l.dst.nodeId === node.id && l.dst.kind === 'exit'),
            )
        );
    }

    // ========================================================================
    // Node dimensions
    // ========================================================================

    nodeWidth(_n: GFlowNode): number {
        return NODE_WIDTH;
    }

    nodeHeight(n: GFlowNode): number {
        const namedOutputs = n.outputs.filter(o => !!o.name).length;
        return namedOutputs > 0 ? 60 + namedOutputs * NODE_ROW_HEIGHT + 10 : NODE_BASE_HEIGHT;
    }

    // ========================================================================
    // Private methods - Pan
    // ========================================================================

    private beginPan(ev: MouseEvent): void {
        this.panState = { active: true, moved: false, startX: ev.clientX, startY: ev.clientY };
        this.worldDragging = true;
        this.updateCursor();
    }

    private updatePan(ev: MouseEvent): void {
        if (!this.panState.moved) {
            const dx = Math.abs(ev.clientX - this.panState.startX);
            const dy = Math.abs(ev.clientY - this.panState.startY);
            if (dx + dy > CLICK_TO_DRAG_THRESHOLD_PX) {
                this.panState.moved = true;
            }
        }
        this.viewport.moveBy(ev.movementX, ev.movementY);
        this.renderer.schedule();
    }

    private endPan(): void {
        if (this.panState.moved) this.skipNextClick = true;
        this.panState.active = false;
        this.worldDragging = false;
        this.updateCursor();
    }

    // ========================================================================
    // Private methods - Selection
    // ========================================================================

    private beginSelection(ev: MouseEvent): void {
        if (!ev.shiftKey && !ev.ctrlKey) this.deselectAll();
        const bounds = this.viewportRef().nativeElement.getBoundingClientRect();
        const x = ev.clientX - bounds.left;
        const y = ev.clientY - bounds.top;
        this.selectionState = {
            active: true,
            startX: x,
            startY: y,
            currentX: x,
            currentY: y,
            style: { left: `${x}px`, top: `${y}px`, width: '0px', height: '0px' },
        };
    }

    private updateSelection(ev: MouseEvent): void {
        const bounds = this.viewportRef().nativeElement.getBoundingClientRect();
        const x = ev.clientX - bounds.left;
        const y = ev.clientY - bounds.top;
        this.selectionState.currentX = x;
        this.selectionState.currentY = y;

        const minX = Math.min(this.selectionState.startX, x);
        const minY = Math.min(this.selectionState.startY, y);
        const width = Math.abs(x - this.selectionState.startX);
        const height = Math.abs(y - this.selectionState.startY);

        this.selectionState.style = {
            left: `${minX}px`,
            top: `${minY}px`,
            width: `${width}px`,
            height: `${height}px`,
        };

        const worldTL = this.viewport.toWorld(bounds.left + minX, bounds.top + minY);
        const worldBR = this.viewport.toWorld(bounds.left + minX + width, bounds.top + minY + height);
        const sel = {
            x: Math.min(worldTL.x, worldBR.x),
            y: Math.min(worldTL.y, worldBR.y),
            w: Math.abs(worldBR.x - worldTL.x),
            h: Math.abs(worldBR.y - worldTL.y),
        };

        this.nodes.forEach(n => {
            const nw = this.nodeWidth(n);
            const nh = this.nodeHeight(n);
            const hit = sel.x < n.x + nw && sel.x + sel.w > n.x && sel.y < n.y + nh && sel.y + sel.h > n.y;
            if (hit) n.selected = true;
        });
        this.cdr.markForCheck();
    }

    private endSelection(): void {
        const dx = Math.abs(this.selectionState.currentX - this.selectionState.startX);
        const dy = Math.abs(this.selectionState.currentY - this.selectionState.startY);

        if (dx > 3 || dy > 3) {
            this.skipNextClick = true;
        }

        this.selectionState = this.createBlankSelectionState();
    }

    // ========================================================================
    // Private methods - Drag
    // ========================================================================

    private updateDrag(ev: MouseEvent): void {
        const n = this.dragState.node!;
        const world = this.viewport.toWorld(ev.clientX, ev.clientY);

        n.x = world.x - this.dragState.dx;
        n.y = world.y - this.dragState.dy;

        const dx = n.x - this.dragState.startX;
        const dy = n.y - this.dragState.startY;

        for (const g of this.dragState.group) {
            g.node.x = g.x0 + dx;
            g.node.y = g.y0 + dy;
        }

        this.renderer.schedule();
    }

    private endDrag(): void {
        const n = this.dragState.node!;
        n.x = this.viewport.snap(n.x);
        n.y = this.viewport.snap(n.y);

        for (const g of this.dragState.group) {
            g.node.x = this.viewport.snap(g.node.x);
            g.node.y = this.viewport.snap(g.node.y);
        }

        this.resolveCollisions(n);
        this.dragState = this.createBlankDragState();
        this.isDirty.set(true);
    }

    // ========================================================================
    // Private methods - Link creation
    // ========================================================================

    private updatePendingLink(ev: MouseEvent): void {
        if (!this.pendingLink) return;

        const world = this.viewport.toWorld(ev.clientX, ev.clientY);
        const snap = this.findSnappablePort(ev.clientX, ev.clientY, this.pendingLink.from);

        if (snap) {
            if (this.snappedPort && this.snappedPort.element !== snap.element) {
                this.snappedPort.element.classList.remove('is-snapped');
            }
            snap.element.classList.add('is-snapped');
            this.snappedPort = snap;
            this.pendingLink = { ...this.pendingLink, mouse: snap.center };
        } else {
            if (this.snappedPort) {
                this.snappedPort.element.classList.remove('is-snapped');
                this.snappedPort = null;
            }
            this.pendingLink = { ...this.pendingLink, mouse: world };
        }
        this.renderer.updatePendingLink(this.pendingLink);
    }

    private endLink(ev: MouseEvent): void {
        if (this.snappedPort) {
            this.connectToSnap();
        } else {
            const portEl = (ev.target as HTMLElement)?.closest(
                '.input-port, .output-port, .entry-port, .exit-port',
            ) as HTMLElement | null;
            if (portEl) {
                this.connectToPort(portEl);
            } else {
                this.createNodeFromDrop(this.pendingLink!);
            }
        }

        if (this.snappedPort) {
            this.snappedPort.element.classList.remove('is-snapped');
            this.snappedPort = null;
        }
        this.pendingLink = null;
        this.renderer.updatePendingLink(null);
    }

    private connectToPort(portEl: HTMLElement): void {
        const host = portEl.closest('[data-node-id]') as HTMLElement;
        const nodeId = host.getAttribute('data-node-id')!;
        const portIndex = Number(portEl.getAttribute('data-index') || 0);
        const kind = this.getPortKind(portEl);

        const to: PortRef = { nodeId, portIndex, kind };
        this.safeCreateLink(this.pendingLink!.from, to);
    }

    private connectToSnap(): void {
        if (!this.pendingLink || !this.snappedPort) return;
        this.safeCreateLink(this.pendingLink.from, this.snappedPort.ref);
    }

    private createNodeFromDrop(pending: PendingLink): void {
        const inverse: Record<PortKind, PortKind> = { out: 'in', in: 'out', entry: 'exit', exit: 'entry' };
        const targetKind = inverse[pending.from.kind];

        const x = this.viewport.snap(pending.mouse.x - this.nodeSize / 2);
        const y = this.viewport.snap(pending.mouse.y - this.nodeSize / 2);

        const newNode = this.state.addNode('new', x, y);

        const hasEntries = (newNode.entries?.length ?? 0) > 0;
        const hasExits = (newNode.exits?.length ?? 0) > 0;

        if ((targetKind === 'entry' && !hasEntries) || (targetKind === 'exit' && !hasExits)) {
            this.focusNode(newNode);
            this.afterGraphChange();
            return;
        }

        const newPort: PortRef = { nodeId: newNode.id, portIndex: 0, kind: targetKind };

        if (['out', 'entry'].includes(pending.from.kind)) {
            this.safeCreateLink(pending.from, newPort);
        } else {
            this.safeCreateLink(newPort, pending.from);
        }

        this.simplifyNewNode(newNode, targetKind);
        this.focusNode(newNode);
    }

    private safeCreateLink(a: PortRef, b: PortRef): void {
        if (a.nodeId === b.nodeId && a.kind === b.kind && a.portIndex === b.portIndex) return;

        const dup = this.links.some(
            l =>
                l.src.nodeId === a.nodeId &&
                l.src.kind === a.kind &&
                l.src.portIndex === a.portIndex &&
                l.dst.nodeId === b.nodeId &&
                l.dst.kind === b.kind &&
                l.dst.portIndex === b.portIndex,
        );
        if (dup) return;

        this.state.createLinkBetween(a, b);
        this.afterGraphChange();
    }

    private findSnappablePort(mouseX: number, mouseY: number, source: PortRef): SnappedPort | null {
        const vp = this.viewportRef().nativeElement;
        let selector: string;
        let target: PortKind;

        if (source.kind === 'out') {
            selector = '.input-port';
            target = 'in';
        } else if (source.kind === 'in') {
            selector = '.output-port';
            target = 'out';
        } else if (source.kind === 'entry') {
            selector = '.exit-port';
            target = 'exit';
        } else {
            selector = '.entry-port';
            target = 'entry';
        }

        const candidates = vp.querySelectorAll(selector);
        let closest: SnappedPort | null = null;
        let min = Infinity;

        candidates.forEach(el => {
            const element = el as HTMLElement;
            const nodeEl = element.closest('[data-node-id]');
            if (!nodeEl) return;

            const nodeId = nodeEl.getAttribute('data-node-id');
            if (nodeId === source.nodeId) return;

            const r = element.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const d = Math.hypot(mouseX - cx, mouseY - cy);

            if (d < SNAP_THRESHOLD_PX && d < min) {
                min = d;
                const idx = Number(element.getAttribute('data-index') || 0);
                closest = {
                    element,
                    ref: { nodeId: nodeId!, portIndex: idx, kind: target },
                    center: this.viewport.toWorld(cx, cy),
                };
            }
        });

        return closest;
    }

    // ========================================================================
    // Private methods - Node operations
    // ========================================================================

    private addNodeAt(type: NodeType, wx: number, wy: number): void {
        if (type === 'start' && this.state.hasStart()) {
            this.showWarning('Le flux possède déjà un point de départ.');
            return;
        }
        const x = this.viewport.snap(wx - this.nodeSize / 2);
        const y = this.viewport.snap(wy - this.nodeSize / 2);
        const node = this.state.addNode(type, x, y);
        this.focusNode(node);
        this.openConfig();
        this.renderer.schedule();
    }

    private splitLinkWithNode(link: GFlowLink, nodeType: NodeType, x: number, y: number): void {
        const nodeX = this.viewport.snap(x - this.nodeSize / 2);
        const nodeY = this.viewport.snap(y - this.nodeSize / 2);
        const newNode = this.state.addNode(nodeType, nodeX, nodeY);

        const hasInput = newNode.inputs && newNode.inputs.length > 0;
        const hasOutput = newNode.outputs && newNode.outputs.length > 0;

        if (!hasInput || !hasOutput) return;

        this.state.removeLink(link.id);

        this.state.createLinkBetween(link.src, {
            nodeId: newNode.id,
            kind: 'in',
            portIndex: 0,
        });

        this.state.createLinkBetween(
            {
                nodeId: newNode.id,
                kind: 'out',
                portIndex: 0,
            },
            link.dst,
        );

        this.focusNode(newNode);
        this.openConfig();
        this.renderer.schedule();
    }

    private simplifyNewNode(node: GFlowNode, used: PortKind): void {
        node.entries = used === 'entry' ? node.entries : [];
        node.exits = used === 'exit' ? node.exits : [];
        node.inputs = used === 'in' ? node.inputs : [];
        node.outputs = used === 'out' ? node.outputs : [];
    }

    private performDeletion(nodes: GFlowNode[], link: GFlowLink | null): void {
        if (nodes.length > 0) {
            nodes.forEach(n => {
                if (n.type !== 'start') {
                    this.state.deleteNode(n.id);
                }
            });
            this.focusNode(null);
        }

        if (link) {
            this.state.removeLink(link.id);
            this.focusLink(null);
        }

        this.afterGraphChange();
        this.closeConfig();
        this.messageService.add({ severity: 'info', summary: 'Supprimé', detail: 'Élément(s) supprimé(s)' });
    }

    private resolveCollisions(active: GFlowNode): void {
        const margin = this.baseStep;
        const A = { x: active.x, y: active.y, w: this.nodeWidth(active), h: this.nodeHeight(active) };
        const hit = { x: A.x - margin / 2, y: A.y - margin / 2, w: A.w + margin, h: A.h + margin };

        for (const other of this.nodes) {
            if (other.id === active.id) continue;
            if (this.dragState.group.some(g => g.node.id === other.id)) continue;

            const B = { x: other.x, y: other.y, w: this.nodeWidth(other), h: this.nodeHeight(other) };
            const overlap = hit.x < B.x + B.w && hit.x + hit.w > B.x && hit.y < B.y + B.h && hit.y + hit.h > B.y;
            if (!overlap) continue;

            const cA = { x: A.x + A.w / 2, y: A.y + A.h / 2 };
            const cB = { x: B.x + B.w / 2, y: B.y + B.h / 2 };
            const dx = cB.x - cA.x;
            const dy = cB.y - cA.y;
            const avgW = (A.w + B.w) / 2;
            const avgH = (A.h + B.h) / 2;

            if (Math.abs(dx) / avgW > Math.abs(dy) / avgH) {
                other.x = this.viewport.snap(dx > 0 ? A.x + A.w + margin : A.x - B.w - margin);
            } else {
                other.y = this.viewport.snap(dy > 0 ? A.y + A.h + margin : A.y - B.h - margin);
            }
        }
    }

    // ========================================================================
    // Private methods - Utilities
    // ========================================================================

    private deselectAll(): void {
        this.nodes.forEach(n => (n.selected = false));
        this.focusNode(null);
        this.focusLink(null);
        this.closeConfig();
    }

    private afterGraphChange(): void {
        this.refreshFocusedInputMap();
        this.cdr.markForCheck();
        this.renderer.schedule();
        this.isDirty.set(true);
    }

    private refreshFocusedInputMap(): void {
        this.focusedInputMap = this.focusedNode ? this.state.aggregatedInputMap(this.focusedNode.id) : null;
    }

    private updateCursor(): void {
        const el = this.viewportRef().nativeElement;
        el.style.cursor = this.currentTool() === 'pan' ? (this.worldDragging ? 'grabbing' : 'grab') : 'default';
    }

    private centerOnStartNode(): void {
        setTimeout(() => {
            const startNode = this.nodes.find(n => n.type === 'start');
            if (startNode) {
                this.viewport.centerOn(startNode.x, startNode.y, this.nodeWidth(startNode), this.nodeHeight(startNode));
                this.renderer.schedule();
                this.cdr.detectChanges();
            }
            this.shouldCenterOnStart = false;
        }, 0);
    }

    private findLinkAt(x: number, y: number): GFlowLink | null {
        const threshold = 16;

        for (const link of this.links) {
            if (link.mid) {
                const dist = Math.hypot(link.mid.x - x, link.mid.y - y);
                if (dist < threshold * 3) {
                    return link;
                }
            }
        }

        return null;
    }

    private isPortElement(el: HTMLElement): boolean {
        return !!el?.closest('.input-port, .output-port, .entry-port, .exit-port');
    }

    private getPortKind(portEl: HTMLElement): PortKind {
        if (portEl.classList.contains('output-port')) return 'out';
        if (portEl.classList.contains('entry-port')) return 'entry';
        if (portEl.classList.contains('exit-port')) return 'exit';
        return 'in';
    }

    private showWarning(message: string): void {
        this.messageService.add({ severity: 'warn', summary: 'Impossible', detail: message });
    }

    private createBlankDragState(): DragState {
        return { active: false, node: null, startX: 0, startY: 0, dx: 0, dy: 0, group: [] };
    }

    private createBlankSelectionState(): SelectionState {
        return {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            style: { left: '0px', top: '0px', width: '0px', height: '0px' },
        };
    }
}

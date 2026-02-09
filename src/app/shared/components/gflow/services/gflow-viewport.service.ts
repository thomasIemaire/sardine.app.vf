import { Injectable } from '@angular/core';

export interface Point {
    x: number;
    y: number;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 2;
const ZOOM_SENSITIVITY = 0.001;

@Injectable()
export class GflowViewportService {
    ox = 0;
    oy = 0;
    scale = 1;

    readonly baseStep = 24;
    readonly baseDot = 1;

    private viewport: HTMLElement | null = null;

    get nodeSize(): number {
        return 4 * this.baseStep;
    }

    setViewport(element: HTMLElement): void {
        this.viewport = element;
    }

    getViewport(): HTMLElement | null {
        return this.viewport;
    }

    toWorld(clientX: number, clientY: number): Point {
        if (!this.viewport) {
            return { x: clientX, y: clientY };
        }

        const rect = this.viewport.getBoundingClientRect();
        const vx = clientX - rect.left;
        const vy = clientY - rect.top;

        return {
            x: (vx - this.ox) / this.scale,
            y: (vy - this.oy) / this.scale,
        };
    }

    toScreen(worldX: number, worldY: number): Point {
        return {
            x: worldX * this.scale + this.ox,
            y: worldY * this.scale + this.oy,
        };
    }

    snap(value: number): number {
        const g = this.baseStep;
        return Math.round((value + g) / g) * g - g;
    }

    applyWheel(event: WheelEvent): void {
        event.preventDefault();

        const factor = Math.exp(-event.deltaY * ZOOM_SENSITIVITY);
        const previousScale = this.scale;
        this.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, this.scale * factor));

        if (!this.viewport || this.scale === previousScale) {
            return;
        }

        const rect = this.viewport.getBoundingClientRect();
        const cx = event.clientX - rect.left;
        const cy = event.clientY - rect.top;

        const scaleFactor = this.scale / previousScale;
        this.ox = cx - (cx - this.ox) * scaleFactor;
        this.oy = cy - (cy - this.oy) * scaleFactor;
    }

    moveBy(dx: number, dy: number): void {
        this.ox += dx;
        this.oy += dy;
    }

    centerOn(worldX: number, worldY: number, width: number, height: number): void {
        if (!this.viewport) {
            return;
        }

        const rect = this.viewport.getBoundingClientRect();
        const viewportCenterX = rect.width / 2;
        const viewportCenterY = rect.height / 2;
        const worldCenterX = worldX + width / 2;
        const worldCenterY = worldY + height / 2;

        this.ox = viewportCenterX - worldCenterX * this.scale;
        this.oy = viewportCenterY - worldCenterY * this.scale;
    }

    reset(): void {
        this.ox = 0;
        this.oy = 0;
        this.scale = 1;
    }
}

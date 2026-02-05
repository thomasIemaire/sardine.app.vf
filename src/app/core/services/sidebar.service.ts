import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    private _collapsed = signal(false);
    readonly collapsed = this._collapsed.asReadonly();

    toggle(): void {
        this._collapsed.update(v => !v);
    }

    collapse(): void {
        this._collapsed.set(true);
    }

    expand(): void {
        this._collapsed.set(false);
    }
}

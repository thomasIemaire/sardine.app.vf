import { Component, inject, signal, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarService } from '../../../core/services';
import { BrandComponent, SidebarMenuComponent, SidebarMenuItemComponent } from "../../../shared";

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, BrandComponent, SidebarMenuComponent, SidebarMenuItemComponent],
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.scss'],
    host: {
        '[class.collapsed]': 'sidebarService.collapsed()',
        '[class.auto-opened]': 'autoOpened()',
        '(mouseenter)': 'onMouseEnter()',
        '(mouseleave)': 'onMouseLeave()'
    }
})
export class SidebarComponent implements OnDestroy {
    protected sidebarService = inject(SidebarService);
    protected autoOpened = signal(false);

    private closeTimeout: ReturnType<typeof setTimeout> | null = null;

    onTriggerEnter(): void {
        this.cancelCloseTimeout();
        if (this.sidebarService.collapsed()) {
            this.autoOpened.set(true);
            this.sidebarService.expand();
        }
    }

    onMouseEnter(): void {
        this.cancelCloseTimeout();
    }

    onMouseLeave(): void {
        if (this.autoOpened()) {
            this.closeTimeout = setTimeout(() => {
                this.autoOpened.set(false);
                this.sidebarService.collapse();
            }, 150);
        }
    }

    private cancelCloseTimeout(): void {
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }
    }

    ngOnDestroy(): void {
        this.cancelCloseTimeout();
    }
}
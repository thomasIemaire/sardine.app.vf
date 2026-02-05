import { Component, computed, inject, OnDestroy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Organization, SidebarService, UserService } from "@core/services";
import { BrandComponent, ContextSelectorComponent } from "@shared/components";
import { NavigationItemComponent } from "./navigation-item/navigation-item";
import { NavigationMenuComponent } from "./navigation-menu/navigation-menu";
import { DividerModule } from "primeng/divider";

@Component({
    selector: "app-sidebar",
    imports: [CommonModule, BrandComponent, ContextSelectorComponent, NavigationMenuComponent, NavigationItemComponent, DividerModule],
    templateUrl: "./sidebar.html",
    styleUrls: ["./sidebar.scss"],
})
export class SidebarComponent implements OnDestroy {
    protected sidebarService = inject(SidebarService);
    private userService = inject(UserService);
    protected autoOpened = signal(false);

    private closeTimeout: ReturnType<typeof setTimeout> | null = null;

    expanded = signal(false);
    organizations = computed(() => {
        const currentId = this.userService.context().organization?.id;
        return (this.userService.user()?.organizations ?? []).filter(org => org.id !== currentId).slice(0, 3);
    });

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

    toggleContextPanel(): void {
        this.expanded.update(v => !v);
    }

    selectOrganization(organization: Organization): void {
        this.userService.selectContext(organization);
        this.expanded.set(false);
    }

    openContextSwitcher(): void {
        this.userService.clearContext();
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

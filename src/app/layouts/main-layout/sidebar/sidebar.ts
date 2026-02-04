import { Component, computed, inject, signal } from "@angular/core";
import { Organization, UserService } from "@core/services";
import { BrandComponent, ContextSelectorComponent } from "@shared/components";
import { NavigationItemComponent } from "./navigation-item/navigation-item";
import { NavigationMenuComponent } from "./navigation-menu/navigation-menu";
import { DividerModule } from "primeng/divider";

@Component({
    selector: "app-sidebar",
    imports: [BrandComponent, ContextSelectorComponent, NavigationMenuComponent, NavigationItemComponent, DividerModule],
    templateUrl: "./sidebar.html",
    styleUrls: ["./sidebar.scss"],
})
export class SidebarComponent {
    private userService = inject(UserService);

    expanded = signal(false);
    organizations = computed(() => {
        const currentId = this.userService.context().organization?.id;
        return (this.userService.user()?.organizations ?? []).filter(org => org.id !== currentId);
    });

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
}
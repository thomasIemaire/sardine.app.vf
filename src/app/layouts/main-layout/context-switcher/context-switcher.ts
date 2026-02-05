import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { Organization, UserService } from "@core/services";
import { ContextItemComponent } from "./context-item/context-item";

@Component({
    selector: "app-context-switcher",
    imports: [FormsModule, ContextItemComponent, ToggleSwitchModule],
    templateUrl: "./context-switcher.html",
    styleUrls: ["./context-switcher.scss"]
})
export class ContextSwitcherComponent {
    private userService = inject(UserService);

    organizations = computed(() => this.userService.user()?.organizations ?? []);
    searchQuery = signal('');
    stopAsking = false;

    hasOverflow = computed(() => this.organizations().length > 5);
    remainingCount = computed(() => this.organizations().length - 5);

    displayedOrganizations = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        const orgs = this.organizations();

        if (query) {
            return orgs.filter(org =>
                org.name.toLowerCase().includes(query) ||
                (org.holdingName?.toLowerCase().includes(query) ?? false)
            );
        }

        return orgs.slice(0, 5);
    });

    onSelectOrganization(organization: Organization): void {
        this.userService.selectContext(organization, this.stopAsking);
    }

    onSearchInput(event: Event): void {
        this.searchQuery.set((event.target as HTMLInputElement).value);
    }
}

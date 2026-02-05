import { Component, computed, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { Organization, UserService } from "@core/services";
import { ContextItemComponent } from "./context-item/context-item";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-context-switcher",
    imports: [CommonModule, FormsModule, ContextItemComponent, ToggleSwitchModule],
    templateUrl: "./context-switcher.html",
    styleUrls: ["./context-switcher.scss"]
})
export class ContextSwitcherComponent {
    private userService = inject(UserService);

    organizations = computed(() => this.userService.user()?.organizations ?? []);

    stopAsking = false;

    onSelectOrganization(organization: Organization): void {
        this.userService.selectContext(organization, this.stopAsking);
    }
}
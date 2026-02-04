import { Component, computed, inject } from "@angular/core";
import { UserService } from "@core/services";

@Component({
    selector: "app-context-selector",
    templateUrl: "./context-selector.html",
    styleUrls: ["./context-selector.scss"],
})
export class ContextSelectorComponent {
    private userService = inject(UserService);

    currentOrganization = computed(() => this.userService.context().organization);
    isPersonal = computed(() => this.currentOrganization()?.isPersonal ?? false);
    name = computed(() => this.currentOrganization()?.name ?? '');
    holdingName = computed(() => this.currentOrganization()?.holdingName ?? '');
}

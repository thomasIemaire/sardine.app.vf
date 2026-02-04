import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { UserService } from "@core/services";
import { ContextSwitcherComponent } from "./context-switcher/context-switcher";
import { SidebarComponent } from "./sidebar/sidebar";
import { HeaderComponent } from "./header/header";

@Component({
    selector: "app-main-layout",
    imports: [RouterOutlet, ContextSwitcherComponent, SidebarComponent, HeaderComponent],
    templateUrl: "./main-layout.html",
    styleUrls: ["./main-layout.scss"],
})
export class MainLayoutComponent {
    private userService = inject(UserService);

    userHasOrganizations(): boolean {
        return this.userService.hasOrganizations();
    }

    userHasContext(): boolean {
        return this.userService.hasContext();
    }
}

import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ContextSwitcherComponent } from "./context-switcher/context-switcher";

@Component({
    selector: "app-main-layout",
    imports: [RouterOutlet, ContextSwitcherComponent],
    templateUrl: "./main-layout.html",
    styleUrls: ["./main-layout.scss"],
})
export class MainLayoutComponent {
    public userHasOrganizations(): boolean {
        return true;
    }

    public userHasContext(): boolean {
        return false;
    }
}

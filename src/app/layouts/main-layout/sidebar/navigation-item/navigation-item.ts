import { Component, input } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: "app-navigation-item",
    imports: [RouterLink, RouterLinkActive],
    templateUrl: "./navigation-item.html",
    styleUrls: ["./navigation-item.scss"],
})
export class NavigationItemComponent {
    label = input.required<string>();
    icon = input.required<string>();
    routerLink = input.required<string>();
}

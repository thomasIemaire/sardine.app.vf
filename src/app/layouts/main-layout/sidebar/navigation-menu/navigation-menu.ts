import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";

@Component({
    selector: "app-navigation-menu",
    imports: [CommonModule],
    templateUrl: "./navigation-menu.html",
    styleUrls: ["./navigation-menu.scss"],
})
export class NavigationMenuComponent {
    label = input<string>();
}

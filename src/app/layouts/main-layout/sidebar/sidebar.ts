import { Component } from "@angular/core";
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
export class SidebarComponent {}
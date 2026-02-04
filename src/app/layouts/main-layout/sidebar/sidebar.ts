import { Component } from "@angular/core";
import { BrandComponent, ContextSelectorComponent } from "@shared/components";

@Component({
    selector: "app-sidebar",
    imports: [BrandComponent, ContextSelectorComponent],
    templateUrl: "./sidebar.html",
    styleUrls: ["./sidebar.scss"],
})
export class SidebarComponent {}
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";

@Component({
    selector: "app-header",
    imports: [CommonModule, ButtonModule, DividerModule],
    templateUrl: "./header.html",
    styleUrls: ["./header.scss"],
})
export class HeaderComponent {
    
}
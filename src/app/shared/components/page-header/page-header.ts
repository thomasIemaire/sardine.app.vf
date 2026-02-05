import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { ButtonModule } from "primeng/button";

export interface PageHeaderTab {
    id: string;
    label: string;
    active?: boolean;
}

@Component({
    selector: "app-page-header",
    imports: [CommonModule, ButtonModule],
    templateUrl: "./page-header.html",
    styleUrls: ["./page-header.scss"],
}) export class PageHeaderComponent {
    label = input.required<string>();
    description = input<string>();
    tabs = input<PageHeaderTab[]>();
}
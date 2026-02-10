import { CommonModule } from "@angular/common";
import { Component, input, viewChild } from "@angular/core";
import { PulsingDotComponent, SelectableComponent } from "@shared/components";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Menu, MenuModule } from "primeng/menu";

export interface CreatedBy {
    id: string;
    name: string;
    context: string;
}

export interface AgentItem {
    id: string;
    name: string;
    reference: string;
    version: string;
    description: string;
    status: "active" | "inactive" | "error";
    createdBy: CreatedBy;
    createdAt: Date;
}

@Component({
    selector: "app-agent-item",
    imports: [CommonModule, SelectableComponent, PulsingDotComponent, ButtonModule, MenuModule],
    templateUrl: "./agent-item.html",
    styleUrls: ["./agent-item.scss"],
})
export class AgentItemComponent {
    agent = input.required<AgentItem>();
    menuItems = input.required<MenuItem[]>();

    menu = viewChild.required<Menu>('menu');

    toggleMenu(event: Event): void {
        this.menu().toggle(event);
    }
}
import { CommonModule } from "@angular/common";
import { Component, input, viewChild } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Menu, MenuModule } from "primeng/menu";

export interface TeamItem {
    id: string;
    name: string;
    description: string;
    membersCount: number;
    createdAt: Date;
}

@Component({
    selector: "app-team-item",
    imports: [CommonModule, SelectableComponent, ButtonModule, MenuModule],
    templateUrl: "./team-item.html",
    styleUrls: ["./team-item.scss"],
})
export class TeamItemComponent {
    team = input.required<TeamItem>();
    menuItems = input.required<MenuItem[]>();

    menu = viewChild.required<Menu>('menu');

    toggleMenu(event: Event): void {
        this.menu().toggle(event);
    }
}

import { CommonModule } from "@angular/common";
import { Component, input, viewChild } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Menu, MenuModule } from "primeng/menu";

export interface OrganizationItem {
    id: string;
    name: string;
    description: string;
    holding: string;
    distributor: string;
    membersCount: number;
    createdBy: { id: string; name: string };
    createdAt: Date;
}

@Component({
    selector: "app-organization-item",
    imports: [CommonModule, SelectableComponent, ButtonModule, MenuModule],
    templateUrl: "./organization-item.html",
    styleUrls: ["./organization-item.scss"],
})
export class OrganizationItemComponent {
    organization = input.required<OrganizationItem>();
    menuItems = input.required<MenuItem[]>();

    menu = viewChild.required<Menu>('menu');

    toggleMenu(event: Event): void {
        this.menu().toggle(event);
    }
}

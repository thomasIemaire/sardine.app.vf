import { CommonModule } from "@angular/common";
import { Component, input, viewChild } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Menu, MenuModule } from "primeng/menu";

export interface MemberItem {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member' | 'reader';
    addedAt: Date;
}

@Component({
    selector: "app-member-item",
    imports: [CommonModule, SelectableComponent, ButtonModule, MenuModule],
    templateUrl: "./member-item.html",
    styleUrls: ["./member-item.scss"],
})
export class MemberItemComponent {
    member = input.required<MemberItem>();
    menuItems = input.required<MenuItem[]>();

    menu = viewChild.required<Menu>('menu');

    toggleMenu(event: Event): void {
        this.menu().toggle(event);
    }

    roleLabel(): string {
        const roles: Record<string, string> = { admin: 'Admin', member: 'Membre', reader: 'Lecteur' };
        return roles[this.member().role] ?? '';
    }
}

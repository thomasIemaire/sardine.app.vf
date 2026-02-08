import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { ButtonModule } from "primeng/button";

export interface MemberItem {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member' | 'reader';
    addedAt: Date;
}

@Component({
    selector: "app-member-item",
    imports: [CommonModule, SelectableComponent, ButtonModule],
    templateUrl: "./member-item.html",
    styleUrls: ["./member-item.scss"],
})
export class MemberItemComponent {
    member = input.required<MemberItem>();

    roleLabel(): string {
        const roles: Record<string, string> = { admin: 'Admin', member: 'Membre', reader: 'Lecteur' };
        return roles[this.member().role] ?? '';
    }
}

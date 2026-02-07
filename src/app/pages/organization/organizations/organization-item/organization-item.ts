import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { ButtonModule } from "primeng/button";

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
    imports: [CommonModule, SelectableComponent, ButtonModule],
    templateUrl: "./organization-item.html",
    styleUrls: ["./organization-item.scss"],
})
export class OrganizationItemComponent {
    organization = input.required<OrganizationItem>();
}

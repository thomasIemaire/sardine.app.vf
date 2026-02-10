import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { CreatedAtComponent, EntityCardComponent, IconBadgeComponent, ItemInfoComponent } from "@shared/components";
import { MenuItem } from "primeng/api";

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
    imports: [CommonModule, EntityCardComponent, IconBadgeComponent, ItemInfoComponent, CreatedAtComponent],
    templateUrl: "./organization-item.html",
    styleUrls: ["./organization-item.scss"],
})
export class OrganizationItemComponent {
    organization = input.required<OrganizationItem>();
    menuItems = input.required<MenuItem[]>();
}

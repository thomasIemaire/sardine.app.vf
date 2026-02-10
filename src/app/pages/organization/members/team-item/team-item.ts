import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { CreatedAtComponent, EntityCardComponent, IconBadgeComponent, ItemInfoComponent } from "@shared/components";
import { MenuItem } from "primeng/api";

export interface TeamItem {
    id: string;
    name: string;
    description: string;
    membersCount: number;
    createdAt: Date;
}

@Component({
    selector: "app-team-item",
    imports: [CommonModule, EntityCardComponent, IconBadgeComponent, ItemInfoComponent, CreatedAtComponent],
    templateUrl: "./team-item.html",
    styleUrls: ["./team-item.scss"],
})
export class TeamItemComponent {
    team = input.required<TeamItem>();
    menuItems = input.required<MenuItem[]>();
}

import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { ButtonModule } from "primeng/button";

export interface TeamItem {
    id: string;
    name: string;
    description: string;
    membersCount: number;
    createdAt: Date;
}

@Component({
    selector: "app-team-item",
    imports: [CommonModule, SelectableComponent, ButtonModule],
    templateUrl: "./team-item.html",
    styleUrls: ["./team-item.scss"],
})
export class TeamItemComponent {
    team = input.required<TeamItem>();
}

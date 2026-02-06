import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { PulsingDotComponent, SelectableComponent } from "@shared/components";
import { ButtonModule } from "primeng/button";

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
    imports: [CommonModule, SelectableComponent, PulsingDotComponent, ButtonModule],
    templateUrl: "./agent-item.html",
    styleUrls: ["./agent-item.scss"],
})
export class AgentItemComponent {
    agent = input.required<AgentItem>();
}
import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { CreatedAtComponent, CreatedByComponent, EntityCardComponent, PulsingDotComponent } from "@shared/components";
import { MenuItem } from "primeng/api";

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
    imports: [CommonModule, EntityCardComponent, PulsingDotComponent, CreatedByComponent, CreatedAtComponent],
    templateUrl: "./agent-item.html",
    styleUrls: ["./agent-item.scss"],
})
export class AgentItemComponent {
    agent = input.required<AgentItem>();
    menuItems = input.required<MenuItem[]>();

    getStatusColor(): string {
        switch (this.agent().status) {
            case 'active': return 'var(--p-green-500)';
            case 'error': return 'var(--p-red-500)';
            default: return 'var(--p-gray-400)';
        }
    }
}

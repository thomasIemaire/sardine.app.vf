import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GridComponent, PulsingDotComponent, TableToolbarComponent } from "@shared/components";
import { AgentItem, AgentItemComponent } from "./agent-item/agent-item";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { Select } from "primeng/select";

@Component({
    selector: "app-agents",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, AgentItemComponent, TableModule, ButtonModule, PulsingDotComponent, Select],
    templateUrl: "./agents.html",
    styleUrls: ["./agents.scss", "../../_page-table.scss"]
})
export class AgentsComponent {
    currentView: "list" | "card" = "list";

    statusOptions = [
        { label: 'Tous', value: null },
        { label: 'Actif', value: 'active' },
        { label: 'Inactif', value: 'inactive' }
    ];
    selectedStatus: { label: string; value: string | null } | null = null;

    toolbarActions = [
        {
            label: "Ajouter un agent",
            icon: "fa-solid fa-plus",
            onClick: () => {
                console.log("Ajouter un agent");
            }
        }
    ]

    private allAgents: AgentItem[] = [
        {
            id: "1",
            name: "Agent 1",
            reference: "agent-1",
            version: "1.0.0",
            description: "Description de l'agent 1",
            status: "active",
            createdBy: {
                id: "1",
                name: "John Doe"
            },
            createdAt: new Date()
        },
        {
            id: "2",
            name: "Agent 2",
            reference: "agent-2",
            version: "1.0.0",
            description: "Description de l'agent 2",
            status: "inactive",
            createdBy: {
                id: "2",
                name: "Jane Doe"
            },
            createdAt: new Date()
        }
    ];

    agents: AgentItem[] = [...this.allAgents];

    filterByStatus(): void {
        const status = this.selectedStatus?.value;
        if (!status) {
            this.agents = [...this.allAgents];
        } else {
            this.agents = this.allAgents.filter(a => a.status === status);
        }
    }
}

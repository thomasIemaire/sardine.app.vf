import { CommonModule } from "@angular/common";
import { Component, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GridComponent, NoResultsComponent, PulsingDotComponent, TableToolbarComponent } from "@shared/components";
import { CreateAgentData, CreateAgentDialogComponent } from "@shared/dialogs";
import { AgentItem, AgentItemComponent } from "./agent-item/agent-item";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { Select } from "primeng/select";

@Component({
    selector: "app-agents",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, AgentItemComponent, TableModule, ButtonModule, PulsingDotComponent, Select, CreateAgentDialogComponent, NoResultsComponent],
    templateUrl: "./agents.html",
    styleUrls: ["./agents.scss", "../../_page-table.scss"]
})
export class AgentsComponent {
    private createAgentDialog = viewChild.required(CreateAgentDialogComponent);

    currentView: "list" | "card" = "list";

    statusOptions = [
        { label: 'Tous', value: null },
        { label: 'Actif', value: 'active' },
        { label: 'Inactif', value: 'inactive' },
        { label: 'Erreur', value: 'error' }
    ];
    selectedStatus: { label: string; value: string | null } | null = null;

    toolbarActions = [
        {
            label: "Ajouter un agent",
            icon: "fa-solid fa-plus",
            onClick: () => this.openCreateDialog()
        }
    ]

    openCreateDialog(): void {
        this.createAgentDialog().open();
    }

    onAgentCreated(data: CreateAgentData): void {
        const newAgent: AgentItem = {
            id: crypto.randomUUID(),
            name: data.name,
            reference: data.reference,
            version: "1.0.0",
            description: data.description,
            status: data.status,
            createdBy: { id: "1", name: "Utilisateur", context: "sardine" },
            createdAt: new Date()
        };
        this.allAgents.push(newAgent);
        this.filterByStatus();
    }

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
                name: "John Doe",
                context: "sardine"
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
                name: "Jane Doe",
                context: "sardine"
            },
            createdAt: new Date()
        },
        {
            id: "3",
            name: "Agent 3",
            reference: "agent-3",
            version: "1.0.0",
            description: "Description de l'agent 3",
            status: "error",
            createdBy: {
                id: "1",
                name: "John Doe",
                context: "sardine"
            },
            createdAt: new Date()
        }
    ];

    agents: AgentItem[] = [...this.allAgents];

    private searchQuery = '';

    onSearch(query: string): void {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    filterByStatus(): void {
        this.applyFilters();
    }

    private applyFilters(): void {
        let filtered = [...this.allAgents];

        const status = this.selectedStatus?.value;
        if (status) {
            filtered = filtered.filter(a => a.status === status);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(this.searchQuery) ||
                a.reference.toLowerCase().includes(this.searchQuery)
            );
        }

        this.agents = filtered;
    }
}

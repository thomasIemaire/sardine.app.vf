import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, effect, inject, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GridComponent, NoResultsComponent, PulsingDotComponent, TableToolbarComponent } from "@shared/components";
import { CreateAgentData, CreateAgentDialogComponent } from "@shared/dialogs";
import { AgentItem, AgentItemComponent } from "./agent-item/agent-item";
import { MenuItem } from "primeng/api";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { Select } from "primeng/select";
import { AgentsService, UserService } from "@core/services";
import { AgentResponse, AgentStatus } from "@models/api.model";

@Component({
    selector: "app-agents",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, AgentItemComponent, TableModule, ButtonModule, MenuModule, PulsingDotComponent, Select, CreateAgentDialogComponent, NoResultsComponent],
    templateUrl: "./agents.html",
    styleUrls: ["./agents.scss", "../../_page-table.scss"]
})
export class AgentsComponent {
    private cdr = inject(ChangeDetectorRef);
    private agentsService = inject(AgentsService);
    private userService = inject(UserService);
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
    ];

    private allAgents: AgentItem[] = [];
    agents: AgentItem[] = [];
    private searchQuery = '';

    constructor() {
        effect(() => {
            this.userService.context();
            this.loadAgents();
        });
    }

    private loadAgents(): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        const status = this.selectedStatus?.value as AgentStatus | undefined;
        this.agentsService.list(orgId, {
            status: status ?? undefined,
            search: this.searchQuery || undefined
        }).subscribe(agents => {
            this.allAgents = agents.map(a => this.mapAgent(a));
            this.applyFilters();
            this.cdr.markForCheck();
        });
    }

    openCreateDialog(): void {
        this.createAgentDialog().open();
    }

    onAgentCreated(data: CreateAgentData): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.agentsService.create(orgId, {
            name: data.name,
            reference: data.reference,
            description: data.description,
            status: data.status as 'active' | 'inactive'
        }).subscribe(() => this.loadAgents());
    }

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

    getAgentMenuItems(agent: AgentItem): MenuItem[] {
        return [
            {
                label: 'Modifier',
                icon: 'fa-solid fa-pen',
                command: () => console.log('Edit agent', agent)
            },
            { separator: true },
            {
                label: agent.status === 'active' ? 'Désactiver' : 'Activer',
                icon: agent.status === 'active' ? 'fa-jelly-fill fa-regular fa-pause' : 'fa-jelly-fill fa-regular fa-play',
                command: () => this.toggleStatus(agent)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => this.deleteAgent(agent)
            }
        ];
    }

    private toggleStatus(agent: AgentItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.agentsService.toggleStatus(orgId, agent.id).subscribe(() => this.loadAgents());
    }

    private deleteAgent(agent: AgentItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.agentsService.delete(orgId, agent.id).subscribe(() => this.loadAgents());
    }

    private mapAgent(a: AgentResponse): AgentItem {
        return {
            id: a.id,
            name: a.name,
            reference: a.reference,
            version: a.version,
            description: a.description ?? '',
            status: a.status,
            createdBy: {
                id: a.created_by?.id ?? '',
                name: a.created_by ? `${a.created_by.first_name} ${a.created_by.last_name}` : '',
                context: ''
            },
            createdAt: new Date(a.created_at)
        };
    }
}

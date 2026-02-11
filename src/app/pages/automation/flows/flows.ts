import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, computed, effect, inject, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { GflowComponent, GridComponent, NoResultsComponent, PulsingDotComponent, TableToolbarComponent } from "@shared/components";
import { CreateFlowData, CreateFlowDialogComponent, CreateFlowTemplateData, CreateFlowTemplateDialogComponent } from "@shared/dialogs";
import { FlowItem, FlowItemComponent } from "./flow-item/flow-item";
import { MenuItem } from "primeng/api";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { Select } from "primeng/select";
import { FlowsService, UserService } from "@core/services";
import { FlowResponse, FlowStatus } from "@models/api.model";

@Component({
    selector: "app-flows",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, FlowItemComponent, TableModule, ButtonModule, MenuModule, PulsingDotComponent, Select, CreateFlowDialogComponent, CreateFlowTemplateDialogComponent, NoResultsComponent, GflowComponent],
    templateUrl: "./flows.html",
    styleUrls: ["./flows.scss", "../../_page-table.scss"]
})
export class FlowsComponent {
    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);
    private flowsService = inject(FlowsService);
    private userService = inject(UserService);
    private createFlowDialog = viewChild.required(CreateFlowDialogComponent);
    private createFlowTemplateDialog = viewChild.required(CreateFlowTemplateDialogComponent);
    private gflowEditor = viewChild(GflowComponent);

    private activeTab = toSignal(
        this.route.queryParamMap.pipe(map(params => params.get('tab') ?? 'all')),
        { initialValue: 'all' }
    );

    isAllTab = computed(() => this.activeTab() === 'all');

    currentView: "list" | "card" = "list";

    selectedFlow = signal<FlowItem | null>(null);
    isFlowEditorOpen = signal(false);

    statusOptions = [
        { label: 'Tous', value: null },
        { label: 'Actif', value: 'active' },
        { label: 'Inactif', value: 'inactive' },
        { label: 'Erreur', value: 'error' }
    ];
    selectedStatus: { label: string; value: string | null } | null = null;

    toolbarActions = computed(() => [
        {
            label: this.isAllTab() ? "Ajouter un flow" : "Ajouter un modèle",
            icon: "fa-solid fa-plus",
            onClick: () => this.isAllTab() ? this.createFlowDialog().open() : this.createFlowTemplateDialog().open()
        }
    ]);

    private allFlows: FlowItem[] = [];
    flows: FlowItem[] = [];
    private searchQuery = '';

    constructor() {
        effect(() => {
            this.userService.context();
            this.isAllTab();
            this.loadFlows();
        });
    }

    private loadFlows(): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        const isAll = this.isAllTab();
        this.flowsService.list(orgId, {
            is_template: !isAll,
            status: (this.selectedStatus?.value as FlowStatus) ?? undefined,
            search: this.searchQuery || undefined
        }).subscribe(flows => {
            this.allFlows = flows.map(f => this.mapFlow(f));
            this.applyFilters();
            this.cdr.markForCheck();
        });
    }

    onSearch(query: string): void {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    filterByStatus(): void {
        this.applyFilters();
    }

    onFlowCreated(data: CreateFlowData): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.flowsService.create(orgId, {
            name: data.name,
            reference: data.reference,
            description: data.description,
            status: data.status as 'active' | 'inactive',
            is_template: false
        }).subscribe(() => this.loadFlows());
    }

    onFlowTemplateCreated(data: CreateFlowTemplateData): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.flowsService.create(orgId, {
            name: data.name,
            description: data.description,
            status: data.status as 'active' | 'inactive',
            is_template: true
        }).subscribe(() => this.loadFlows());
    }

    applyFilters(): void {
        let filtered = [...this.allFlows];

        const status = this.selectedStatus?.value;
        if (status) {
            filtered = filtered.filter(f => f.status === status);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery) ||
                f.reference?.toLowerCase().includes(this.searchQuery)
            );
        }

        this.flows = filtered;
    }

    openFlowEditor(flow: FlowItem): void {
        this.selectedFlow.set(flow);
        this.isFlowEditorOpen.set(true);

        setTimeout(() => {
            const editor = this.gflowEditor();
            if (editor) {
                editor.loadFlow({
                    title: flow.name,
                    description: flow.description,
                    id: flow.id
                });
            }
        }, 0);
    }

    createNewFlow(): void {
        this.selectedFlow.set(null);
        this.isFlowEditorOpen.set(true);
    }

    closeFlowEditor(): void {
        this.isFlowEditorOpen.set(false);
        this.selectedFlow.set(null);
    }

    onFlowSaved(payload: any): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        const flow = this.selectedFlow();
        if (flow) {
            this.flowsService.update(orgId, flow.id, {
                flow_data: payload.flowData
            }).subscribe(() => this.loadFlows());
        }
    }

    getFlowMenuItems(flow: FlowItem): MenuItem[] {
        return [
            {
                label: 'Ouvrir',
                icon: 'fa-jelly-fill fa-solid fa-arrow-up-right-from-square',
                command: () => this.openFlowEditor(flow)
            },
            { separator: true },
            {
                label: flow.status === 'active' ? 'Désactiver' : 'Activer',
                icon: flow.status === 'active' ? 'fa-jelly-fill fa-solid fa-pause' : 'fa-jelly-fill fa-solid fa-play',
                command: () => this.toggleStatus(flow)
            },
            {
                label: 'Voir les exécutions',
                icon: 'fa-jelly-fill fa-regular fa-clock',
                command: () => console.log('View executions', flow)
            },
            {
                label: 'Exporter',
                icon: 'fa-solid fa-file-export',
                command: () => this.exportFlow(flow)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => this.deleteFlow(flow)
            }
        ];
    }

    private toggleStatus(flow: FlowItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.flowsService.toggleStatus(orgId, flow.id).subscribe(() => this.loadFlows());
    }

    private deleteFlow(flow: FlowItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.flowsService.delete(orgId, flow.id).subscribe(() => this.loadFlows());
    }

    private exportFlow(flow: FlowItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.flowsService.export(orgId, flow.id).subscribe(data => {
            const blob = new Blob([JSON.stringify(data.flow_json, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${flow.name}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    private mapFlow(f: FlowResponse): FlowItem {
        return {
            id: f.id,
            name: f.name,
            reference: f.reference ?? undefined,
            version: f.version,
            description: f.description ?? '',
            status: f.status,
            createdBy: {
                id: f.created_by?.id ?? '',
                name: f.created_by ? `${f.created_by.first_name} ${f.created_by.last_name}` : '',
                context: ''
            },
            createdAt: new Date(f.created_at),
            isTemplate: f.is_template
        };
    }
}

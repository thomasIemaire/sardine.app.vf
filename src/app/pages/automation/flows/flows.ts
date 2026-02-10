import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, signal, viewChild } from "@angular/core";
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

@Component({
    selector: "app-flows",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, FlowItemComponent, TableModule, ButtonModule, MenuModule, PulsingDotComponent, Select, CreateFlowDialogComponent, CreateFlowTemplateDialogComponent, NoResultsComponent, GflowComponent],
    templateUrl: "./flows.html",
    styleUrls: ["./flows.scss", "../../_page-table.scss"]
})
export class FlowsComponent {
    private route = inject(ActivatedRoute);
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

    private allFlows: FlowItem[] = [
        {
            id: "1",
            name: "Flow extraction",
            reference: "flow-extraction",
            version: "1.0.0",
            description: "Extraction automatique des données depuis les documents",
            status: "active",
            createdBy: { id: "1", name: "Thomas Lemaire", context: "sardine" },
            createdAt: new Date(),
            isTemplate: false
        },
        {
            id: "2",
            name: "Flow validation",
            reference: "flow-validation",
            version: "1.0.0",
            description: "Validation des données extraites avant intégration",
            status: "inactive",
            createdBy: { id: "2", name: "John Doe", context: "sardine" },
            createdAt: new Date(),
            isTemplate: false
        },
        {
            id: "3",
            name: "Flow notification",
            reference: "flow-notification",
            version: "1.0.0",
            description: "Envoi de notifications aux utilisateurs concernés",
            status: "error",
            createdBy: { id: "1", name: "Thomas Lemaire", context: "sardine" },
            createdAt: new Date(),
            isTemplate: false
        },
        {
            id: "4",
            name: "Modèle import CSV",
            version: "1.0.0",
            description: "Modèle pour l'import de fichiers CSV",
            status: "active",
            createdBy: { id: "1", name: "Thomas Lemaire", context: "sardine" },
            createdAt: new Date(),
            isTemplate: true
        },
        {
            id: "5",
            name: "Modèle export PDF",
            version: "1.0.0",
            description: "Modèle pour l'export de documents en PDF",
            status: "active",
            createdBy: { id: "2", name: "John Doe", context: "sardine" },
            createdAt: new Date(),
            isTemplate: true
        }
    ];

    flows: FlowItem[] = [];

    private searchQuery = '';

    constructor() {
        effect(() => {
            this.isAllTab();
            this.applyFilters();
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
        this.allFlows.push({
            id: crypto.randomUUID(),
            name: data.name,
            reference: data.reference,
            version: "1.0.0",
            description: data.description,
            status: data.status,
            createdBy: { id: "1", name: "Utilisateur", context: "sardine" },
            createdAt: new Date(),
            isTemplate: false
        });
        this.applyFilters();
    }

    onFlowTemplateCreated(data: CreateFlowTemplateData): void {
        this.allFlows.push({
            id: crypto.randomUUID(),
            name: data.name,
            version: "1.0.0",
            description: data.description,
            status: data.status,
            createdBy: { id: "1", name: "Utilisateur", context: "sardine" },
            createdAt: new Date(),
            isTemplate: true
        });
        this.applyFilters();
    }

    applyFilters(): void {
        const isAll = this.isAllTab();
        let filtered = this.allFlows.filter(f => isAll ? !f.isTemplate : f.isTemplate);

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
        console.log('Flow saved:', payload);
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
                command: () => console.log('Toggle status', flow)
            },
            {
                label: 'Voir les exécutions',
                icon: 'fa-jelly-fill fa-regular fa-clock',
                command: () => console.log('View executions', flow)
            },
            {
                label: 'Exporter',
                icon: 'fa-solid fa-file-export',
                command: () => console.log('Export flow', flow)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => console.log('Delete flow', flow)
            }
        ];
    }
}

import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { GridComponent, NoResultsComponent, PulsingDotComponent, TableToolbarComponent } from "@shared/components";
import { CreateFlowData, CreateFlowDialogComponent, CreateFlowTemplateData, CreateFlowTemplateDialogComponent } from "@shared/dialogs";
import { FlowItem, FlowItemComponent } from "./flow-item/flow-item";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { Select } from "primeng/select";

@Component({
    selector: "app-flows",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, FlowItemComponent, TableModule, ButtonModule, PulsingDotComponent, Select, CreateFlowDialogComponent, CreateFlowTemplateDialogComponent, NoResultsComponent],
    templateUrl: "./flows.html",
    styleUrls: ["./flows.scss", "../../_page-table.scss"]
})
export class FlowsComponent {
    private route = inject(ActivatedRoute);
    private createFlowDialog = viewChild.required(CreateFlowDialogComponent);
    private createFlowTemplateDialog = viewChild.required(CreateFlowTemplateDialogComponent);

    private activeTab = toSignal(
        this.route.queryParamMap.pipe(map(params => params.get('tab') ?? 'all')),
        { initialValue: 'all' }
    );

    isAllTab = computed(() => this.activeTab() === 'all');

    currentView: "list" | "card" = "list";

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
}

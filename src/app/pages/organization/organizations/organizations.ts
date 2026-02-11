import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, effect, inject, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GridComponent, NoResultsComponent, TableToolbarComponent } from "@shared/components";
import { CreateOrganizationData, CreateOrganizationDialogComponent } from "@shared/dialogs";
import { OrganizationItem, OrganizationItemComponent } from "./organization-item/organization-item";
import { MenuItem } from "primeng/api";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { OrganizationsService, UserService } from "@core/services";
import { OrganizationResponse } from "@models/api.model";

@Component({
    selector: "app-organizations",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, OrganizationItemComponent, TableModule, ButtonModule, MenuModule, CreateOrganizationDialogComponent, NoResultsComponent],
    templateUrl: "./organizations.html",
    styleUrls: ["./organizations.scss", "../../_page-table.scss"]
})
export class OrganizationsComponent {
    private cdr = inject(ChangeDetectorRef);
    private organizationsService = inject(OrganizationsService);
    private userService = inject(UserService);
    private createDialog = viewChild.required(CreateOrganizationDialogComponent);

    currentView: "list" | "card" = "list";

    toolbarActions = [
        {
            label: "Créer une organisation",
            icon: "fa-solid fa-plus",
            onClick: () => this.openCreateDialog()
        }
    ];

    private allOrganizations: OrganizationItem[] = [];
    organizations: OrganizationItem[] = [];
    private searchQuery = '';

    constructor() {
        effect(() => {
            this.userService.context();
            this.loadOrganizations();
        });
    }

    private loadOrganizations(): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.organizationsService.getChildren(orgId).subscribe(orgs => {
            this.allOrganizations = orgs.map(o => this.mapOrganization(o));
            this.applyFilters();
            this.cdr.markForCheck();
        });
    }

    openCreateDialog(): void {
        this.createDialog().open();
    }

    onOrganizationCreated(data: CreateOrganizationData): void {
        this.organizationsService.create({
            name: data.name,
            description: data.description || undefined,
            holding_id: data.holding || undefined,
            distributor_id: data.distributor || undefined,
            member_ids: data.members
        }).subscribe(() => this.loadOrganizations());
    }

    onSearch(query: string): void {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    private applyFilters(): void {
        let filtered = [...this.allOrganizations];

        if (this.searchQuery) {
            filtered = filtered.filter(o =>
                o.name.toLowerCase().includes(this.searchQuery) ||
                o.description.toLowerCase().includes(this.searchQuery)
            );
        }

        this.organizations = filtered;
    }

    getOrganizationMenuItems(org: OrganizationItem): MenuItem[] {
        return [
            {
                label: 'Modifier',
                icon: 'fa-solid fa-pen',
                command: () => console.log('Edit organization', org)
            },
            {
                label: 'Gérer les membres',
                icon: 'fa-solid fa-users-gear',
                command: () => console.log('Manage members', org)
            },
            {
                label: 'Paramètres',
                icon: 'fa-jelly-fill fa-solid fa-gear',
                command: () => console.log('View settings', org)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => this.deleteOrganization(org)
            }
        ];
    }

    private deleteOrganization(org: OrganizationItem): void {
        this.organizationsService.delete(org.id).subscribe(() => this.loadOrganizations());
    }

    private mapOrganization(o: OrganizationResponse): OrganizationItem {
        return {
            id: o.id,
            name: o.name,
            description: o.description ?? '',
            holding: o.holding_name ?? '',
            distributor: o.distributor_name ?? '',
            membersCount: o.member_count,
            createdBy: {
                id: o.created_by?.id ?? '',
                name: o.created_by ? `${o.created_by.first_name} ${o.created_by.last_name}` : ''
            },
            createdAt: new Date(o.created_at)
        };
    }
}

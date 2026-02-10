import { CommonModule } from "@angular/common";
import { Component, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GridComponent, NoResultsComponent, TableToolbarComponent } from "@shared/components";
import { CreateOrganizationData, CreateOrganizationDialogComponent } from "@shared/dialogs";
import { OrganizationItem, OrganizationItemComponent } from "./organization-item/organization-item";
import { MenuItem } from "primeng/api";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";

@Component({
    selector: "app-organizations",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, OrganizationItemComponent, TableModule, ButtonModule, MenuModule, CreateOrganizationDialogComponent, NoResultsComponent],
    templateUrl: "./organizations.html",
    styleUrls: ["./organizations.scss", "../../_page-table.scss"]
})
export class OrganizationsComponent {
    private createDialog = viewChild.required(CreateOrganizationDialogComponent);

    currentView: "list" | "card" = "list";

    toolbarActions = [
        {
            label: "Créer une organisation",
            icon: "fa-solid fa-plus",
            onClick: () => this.openCreateDialog()
        }
    ];

    openCreateDialog(): void {
        this.createDialog().open();
    }

    onOrganizationCreated(data: CreateOrganizationData): void {
        const newOrg: OrganizationItem = {
            id: crypto.randomUUID(),
            name: data.name,
            description: data.description,
            holding: data.holding ?? '',
            distributor: data.distributor ?? '',
            membersCount: data.members.length,
            createdBy: { id: "1", name: "Thomas Lemaire" },
            createdAt: new Date()
        };
        this.allOrganizations.push(newOrg);
        this.applyFilters();
    }

    private allOrganizations: OrganizationItem[] = [
        {
            id: "1",
            name: "Sardine",
            description: "Organisation principale de Sardine",
            holding: "Sardine Group",
            distributor: "Distributeur A",
            membersCount: 12,
            createdBy: { id: "1", name: "Thomas Lemaire" },
            createdAt: new Date()
        },
        {
            id: "2",
            name: "Sendoc",
            description: "Gestion documentaire Sendoc",
            holding: "Sendoc Holding",
            distributor: "Distributeur B",
            membersCount: 8,
            createdBy: { id: "2", name: "John Doe" },
            createdAt: new Date()
        },
        {
            id: "3",
            name: "Acme Corp",
            description: "Organisation de test",
            holding: "Sardine Group",
            distributor: "Distributeur A",
            membersCount: 3,
            createdBy: { id: "1", name: "Thomas Lemaire" },
            createdAt: new Date()
        }
    ];

    organizations: OrganizationItem[] = [...this.allOrganizations];

    private searchQuery = '';

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
                command: () => console.log('Delete organization', org)
            }
        ];
    }
}

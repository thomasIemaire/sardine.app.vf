import { CommonModule } from "@angular/common";
import { Component, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GridComponent, NoResultsComponent, TableToolbarComponent } from "@shared/components";
import { AddMemberData, AddMemberDialogComponent } from "@shared/dialogs";
import { MemberItem, MemberItemComponent } from "./member-item/member-item";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { Select } from "primeng/select";

@Component({
    selector: "app-members",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, MemberItemComponent, TableModule, ButtonModule, AddMemberDialogComponent, NoResultsComponent, Select],
    templateUrl: "./members.html",
    styleUrls: ["./members.scss", "../../_page-table.scss"]
})
export class MembersComponent {
    private addMemberDialog = viewChild.required(AddMemberDialogComponent);

    currentView: "list" | "card" = "list";

    roleOptions = [
        { label: 'Tous', value: null },
        { label: 'Admin', value: 'admin' },
        { label: 'Membre', value: 'member' },
        { label: 'Lecteur', value: 'reader' },
    ];
    selectedRole: { label: string; value: string | null } | null = null;

    toolbarActions = [
        {
            label: "Ajouter un membre",
            icon: "fa-solid fa-plus",
            onClick: () => this.openAddDialog()
        }
    ];

    openAddDialog(): void {
        this.addMemberDialog().open();
    }

    onMembersAdded(data: AddMemberData): void {
        for (const entry of data) {
            this.allMembers.push({
                id: crypto.randomUUID(),
                name: entry.email.split('@')[0],
                email: entry.email,
                role: entry.role,
                addedAt: new Date()
            });
        }
        this.applyFilters();
    }

    private allMembers: MemberItem[] = [
        {
            id: "1",
            name: "Thomas Lemaire",
            email: "thomas.lemaire@sendoc.fr",
            role: "admin",
            addedAt: new Date()
        },
        {
            id: "2",
            name: "John Doe",
            email: "john.doe@sendoc.fr",
            role: "member",
            addedAt: new Date()
        },
        {
            id: "3",
            name: "Jane Doe",
            email: "jane.doe@sendoc.fr",
            role: "reader",
            addedAt: new Date()
        }
    ];

    members: MemberItem[] = [...this.allMembers];

    private searchQuery = '';

    onSearch(query: string): void {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    filterByRole(): void {
        this.applyFilters();
    }

    getRoleLabel(role: string): string {
        const roles: Record<string, string> = { admin: 'Admin', member: 'Membre', reader: 'Lecteur' };
        return roles[role] ?? '';
    }

    private applyFilters(): void {
        let filtered = [...this.allMembers];

        const role = this.selectedRole?.value;
        if (role) {
            filtered = filtered.filter(m => m.role === role);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(this.searchQuery) ||
                m.email.toLowerCase().includes(this.searchQuery)
            );
        }

        this.members = filtered;
    }
}

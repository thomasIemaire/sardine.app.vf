import { CommonModule } from "@angular/common";
import { Component, computed, inject, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { GridComponent, NoResultsComponent, TableToolbarComponent } from "@shared/components";
import { AddMemberData, AddMemberDialogComponent, CreateTeamData, CreateTeamDialogComponent } from "@shared/dialogs";
import { MemberItem, MemberItemComponent } from "./member-item/member-item";
import { TeamItem, TeamItemComponent } from "./team-item/team-item";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { Select } from "primeng/select";

@Component({
    selector: "app-members",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, MemberItemComponent, TeamItemComponent, TableModule, ButtonModule, AddMemberDialogComponent, CreateTeamDialogComponent, NoResultsComponent, Select],
    templateUrl: "./members.html",
    styleUrls: ["./members.scss", "../../_page-table.scss"]
})
export class MembersComponent {
    private route = inject(ActivatedRoute);
    private addMemberDialog = viewChild.required(AddMemberDialogComponent);
    private createTeamDialog = viewChild.required(CreateTeamDialogComponent);

    private activeTab = toSignal(
        this.route.queryParamMap.pipe(map(params => params.get('tab') ?? 'users')),
        { initialValue: 'users' }
    );

    isUsersTab = computed(() => this.activeTab() === 'users');

    currentView: "list" | "card" = "list";

    // --- Users ---
    roleOptions = [
        { label: 'Tous', value: null },
        { label: 'Admin', value: 'admin' },
        { label: 'Membre', value: 'member' },
        { label: 'Lecteur', value: 'reader' },
    ];
    selectedRole: { label: string; value: string | null } | null = null;

    userToolbarActions = [
        {
            label: "Ajouter un membre",
            icon: "fa-solid fa-plus",
            onClick: () => this.addMemberDialog().open()
        }
    ];

    private allMembers: MemberItem[] = [
        { id: "1", name: "Thomas Lemaire", email: "thomas.lemaire@sendoc.fr", role: "admin", addedAt: new Date() },
        { id: "2", name: "John Doe", email: "john.doe@sendoc.fr", role: "member", addedAt: new Date() },
        { id: "3", name: "Jane Doe", email: "jane.doe@sendoc.fr", role: "reader", addedAt: new Date() }
    ];

    members: MemberItem[] = [...this.allMembers];
    private memberSearchQuery = '';

    // --- Teams ---
    teamToolbarActions = [
        {
            label: "Créer une équipe",
            icon: "fa-solid fa-plus",
            onClick: () => this.createTeamDialog().open()
        }
    ];

    private allTeams: TeamItem[] = [
        { id: "1", name: "Équipe Développement", description: "Équipe en charge du développement logiciel", membersCount: 5, createdAt: new Date() },
        { id: "2", name: "Équipe Support", description: "Équipe en charge du support client", membersCount: 3, createdAt: new Date() },
        { id: "3", name: "Équipe Commercial", description: "Équipe en charge des ventes", membersCount: 4, createdAt: new Date() }
    ];

    teams: TeamItem[] = [...this.allTeams];
    private teamSearchQuery = '';

    constructor() {}

    // --- Users methods ---
    onSearch(query: string): void {
        this.memberSearchQuery = query.toLowerCase();
        this.applyMemberFilters();
    }

    filterByRole(): void {
        this.applyMemberFilters();
    }

    getRoleLabel(role: string): string {
        const roles: Record<string, string> = { admin: 'Admin', member: 'Membre', reader: 'Lecteur' };
        return roles[role] ?? '';
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
        this.applyMemberFilters();
    }

    private applyMemberFilters(): void {
        let filtered = [...this.allMembers];

        const role = this.selectedRole?.value;
        if (role) {
            filtered = filtered.filter(m => m.role === role);
        }

        if (this.memberSearchQuery) {
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(this.memberSearchQuery) ||
                m.email.toLowerCase().includes(this.memberSearchQuery)
            );
        }

        this.members = filtered;
    }

    // --- Teams methods ---
    onTeamSearch(query: string): void {
        this.teamSearchQuery = query.toLowerCase();
        this.applyTeamFilters();
    }

    onTeamCreated(data: CreateTeamData): void {
        this.allTeams.push({
            id: crypto.randomUUID(),
            name: data.name,
            description: data.description,
            membersCount: data.members.length,
            createdAt: new Date()
        });
        this.applyTeamFilters();
    }

    private applyTeamFilters(): void {
        let filtered = [...this.allTeams];

        if (this.teamSearchQuery) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(this.teamSearchQuery) ||
                t.description.toLowerCase().includes(this.teamSearchQuery)
            );
        }

        this.teams = filtered;
    }
}

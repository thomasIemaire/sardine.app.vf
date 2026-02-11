import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, computed, effect, inject, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { GridComponent, NoResultsComponent, TableToolbarComponent } from "@shared/components";
import { AddMemberData, AddMemberDialogComponent, CreateTeamData, CreateTeamDialogComponent } from "@shared/dialogs";
import { MemberItem, MemberItemComponent } from "./member-item/member-item";
import { TeamItem, TeamItemComponent } from "./team-item/team-item";
import { MenuItem } from "primeng/api";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { Select } from "primeng/select";
import { MembersService, TeamsService, UserService } from "@core/services";
import { MemberResponse, MemberRole, TeamResponse } from "@models/api.model";

@Component({
    selector: "app-members",
    imports: [CommonModule, FormsModule, TableToolbarComponent, GridComponent, MemberItemComponent, TeamItemComponent, TableModule, ButtonModule, MenuModule, AddMemberDialogComponent, CreateTeamDialogComponent, NoResultsComponent, Select],
    templateUrl: "./members.html",
    styleUrls: ["./members.scss", "../../_page-table.scss"]
})
export class MembersComponent {
    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);
    private membersService = inject(MembersService);
    private teamsService = inject(TeamsService);
    private userService = inject(UserService);
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

    private allMembers: MemberItem[] = [];
    members: MemberItem[] = [];
    private memberSearchQuery = '';

    // --- Teams ---
    teamToolbarActions = [
        {
            label: "Créer une équipe",
            icon: "fa-solid fa-plus",
            onClick: () => this.createTeamDialog().open()
        }
    ];

    private allTeams: TeamItem[] = [];
    teams: TeamItem[] = [];
    private teamSearchQuery = '';

    constructor() {
        effect(() => {
            this.userService.context();
            this.loadMembers();
            this.loadTeams();
        });
    }

    // --- Data loading ---
    private loadMembers(): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.membersService.list(orgId, {
            role: (this.selectedRole?.value as MemberRole) ?? undefined,
            search: this.memberSearchQuery || undefined
        }).subscribe(members => {
            this.allMembers = members.map(m => this.mapMember(m));
            this.applyMemberFilters();
            this.cdr.markForCheck();
        });
    }

    private loadTeams(): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.teamsService.list(orgId, {
            search: this.teamSearchQuery || undefined
        }).subscribe(teams => {
            this.allTeams = teams.map(t => this.mapTeam(t));
            this.applyTeamFilters();
            this.cdr.markForCheck();
        });
    }

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
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.membersService.add(orgId, {
            members: data.map(entry => ({ email: entry.email, role: entry.role as MemberRole }))
        }).subscribe(() => this.loadMembers());
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
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.teamsService.create(orgId, {
            name: data.name,
            description: data.description || undefined,
            member_ids: data.members
        }).subscribe(() => this.loadTeams());
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

    getMemberMenuItems(member: MemberItem): MenuItem[] {
        return [
            {
                label: 'Voir le profil',
                icon: 'fa-jelly-fill fa-solid fa-user',
                command: () => console.log('View profile', member)
            },
            {
                label: 'Changer le rôle',
                icon: 'fa-solid fa-user-shield',
                command: () => console.log('Change role', member)
            },
            { separator: true },
            {
                label: 'Retirer',
                icon: 'fa-solid fa-user-minus',
                styleClass: 'menu-item-danger',
                command: () => this.removeMember(member)
            }
        ];
    }

    getTeamMenuItems(team: TeamItem): MenuItem[] {
        return [
            {
                label: 'Modifier',
                icon: 'fa-solid fa-pen',
                command: () => console.log('Edit team', team)
            },
            {
                label: 'Gérer les membres',
                icon: 'fa-solid fa-users-gear',
                command: () => console.log('Manage members', team)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => this.deleteTeam(team)
            }
        ];
    }

    private removeMember(member: MemberItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.membersService.remove(orgId, member.id).subscribe(() => this.loadMembers());
    }

    private deleteTeam(team: TeamItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.teamsService.delete(orgId, team.id).subscribe(() => this.loadTeams());
    }

    private mapMember(m: MemberResponse): MemberItem {
        return {
            id: m.user_id,
            name: `${m.first_name} ${m.last_name}`,
            email: m.email,
            role: m.role,
            addedAt: new Date(m.added_at)
        };
    }

    private mapTeam(t: TeamResponse): TeamItem {
        return {
            id: t.id,
            name: t.name,
            description: t.description ?? '',
            membersCount: t.member_count,
            createdAt: new Date(t.created_at)
        };
    }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem } from 'primeng/api';
import { ThemeService, DisplayMode, TeamsService } from '../../../../../core/services';
import { TeamDetailResponse, TeamMemberInfo, TeamRole } from '../../../../../models';
import {
  AddMemberDialogComponent,
  AddMemberResult
} from '../../../../../shared/dialogs';
import { CardContainerComponent } from '../../../../../shared/components';

type FilterType = 'all' | 'admins' | 'members';

@Component({
  selector: 'app-members-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    Divider,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    ContextMenuModule,
    TagModule,
    ProgressSpinnerModule,
    AddMemberDialogComponent,
    CardContainerComponent
  ],
  templateUrl: './members-tab.html',
  styleUrl: './members-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembersTabComponent {
  private readonly themeService = inject(ThemeService);
  private readonly teamsService = inject(TeamsService);

  readonly addMemberDialog = viewChild<AddMemberDialogComponent>('addMemberDialog');

  // Context menu
  readonly contextMenuItems = signal<MenuItem[]>([]);

  readonly teamId = input<string | null>(null);
  readonly searchQuery = signal('');
  readonly filterType = signal<FilterType>('all');
  readonly displayMode = this.themeService.displayMode;
  readonly loading = signal(false);

  private readonly teamData = signal<TeamDetailResponse | null>(null);
  private readonly allMembers = signal<TeamMemberInfo[]>([]);

  readonly filterOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Administrateurs', value: 'admins' },
    { label: 'Membres', value: 'members' }
  ];

  constructor() {
    effect(() => {
      const id = this.teamId();
      if (id) {
        this.loadTeamMembers(id);
      }
    }, { allowSignalWrites: true });
  }

  private loadTeamMembers(teamId: string): void {
    this.loading.set(true);
    this.teamsService.getTeam(teamId).subscribe({
      next: (team) => {
        this.teamData.set(team);
        // API now returns a single members array with role field
        this.allMembers.set(team.members);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.loading.set(false);
      }
    });
  }

  readonly filteredMembers = computed(() => {
    let members = this.allMembers();

    // Filter by type
    if (this.filterType() === 'admins') {
      members = members.filter(m => m.role === 'admin');
    } else if (this.filterType() === 'members') {
      members = members.filter(m => m.role === 'member');
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      members = members.filter(member =>
        member.firstname.toLowerCase().includes(query) ||
        member.lastname.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      );
    }

    return members;
  });

  readonly adminsCount = computed(() => this.allMembers().filter(m => m.role === 'admin').length);
  readonly membersCount = computed(() => this.filteredMembers().length);

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onFilterChange(value: FilterType): void {
    this.filterType.set(value);
  }

  toggleDisplayMode(): void {
    const newMode: DisplayMode = this.displayMode() === 'table' ? 'card' : 'table';
    this.themeService.setDisplayMode(newMode);
  }

  getRoleSeverity(role: TeamRole): 'success' | 'info' {
    return role === 'admin' ? 'success' : 'info';
  }

  getRoleLabel(role: TeamRole): string {
    return role === 'admin' ? 'Administrateur' : 'Membre';
  }

  openAddMemberDialog(): void {
    const currentTeamId = this.teamId();
    if (currentTeamId) {
      this.addMemberDialog()?.open(currentTeamId as any);
    }
  }

  onMemberAdded(result: AddMemberResult): void {
    // Invite members via API
    const teamId = this.teamId();
    if (!teamId) return;

    for (const member of result.members) {
      this.teamsService.inviteUser(teamId, { email: member.email }).subscribe({
        next: () => this.loadTeamMembers(teamId),
        error: (error) => console.error('Error inviting member:', error)
      });
    }
  }

  // Context menu methods
  buildMemberContextMenu(member: TeamMemberInfo): MenuItem[] {
    const items: MenuItem[] = [];

    if (member.role === 'member') {
      items.push({
        label: 'Promouvoir administrateur',
        icon: 'fa-duotone fa-solid fa-crown',
        command: () => this.promoteToAdmin(member.userId)
      });
    } else if (member.role === 'admin' && this.adminsCount() > 1) {
      items.push({
        label: 'Rétrograder membre',
        icon: 'fa-duotone fa-solid fa-arrow-down',
        command: () => this.demoteToMember(member.userId)
      });
    }

    items.push({ separator: true });
    items.push({
      label: 'Retirer de l\'équipe',
      icon: 'fa-duotone fa-solid fa-user-minus',
      command: () => this.removeMember(member)
    });

    return items;
  }

  onMemberContextMenu(event: MouseEvent, member: TeamMemberInfo): void {
    event.preventDefault();
    this.contextMenuItems.set(this.buildMemberContextMenu(member));
  }

  private promoteToAdmin(userId: string): void {
    const teamId = this.teamId();
    if (!teamId) return;

    this.teamsService.changeMemberRole(teamId, userId, { role: 'admin' }).subscribe({
      next: () => this.loadTeamMembers(teamId),
      error: (error) => console.error('Error promoting member:', error)
    });
  }

  private demoteToMember(userId: string): void {
    const teamId = this.teamId();
    if (!teamId) return;

    this.teamsService.changeMemberRole(teamId, userId, { role: 'member' }).subscribe({
      next: () => this.loadTeamMembers(teamId),
      error: (error) => console.error('Error demoting admin:', error)
    });
  }

  private removeMember(member: TeamMemberInfo): void {
    const teamId = this.teamId();
    if (!teamId) return;

    this.teamsService.removeMember(teamId, member.userId).subscribe({
      next: () => this.loadTeamMembers(teamId),
      error: (error) => console.error('Error removing member:', error)
    });
  }
}

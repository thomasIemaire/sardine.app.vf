import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem } from 'primeng/api';
import { ThemeService, DisplayMode, TeamsService } from '../../../../core/services';
import { CreateTeamDialogComponent, CreateTeamResult } from '../../../../shared/dialogs';
import { CardContainerComponent } from '../../../../shared/components';
import { TeamListItem } from '../../../../models';

type FilterType = 'all' | 'owned' | 'member';

@Component({
  selector: 'app-teams-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    Divider,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    ContextMenuModule,
    ProgressSpinnerModule,
    CreateTeamDialogComponent,
    CardContainerComponent
  ],
  templateUrl: './teams-tab.html',
  styleUrl: './teams-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsTabComponent {
  private readonly themeService = inject(ThemeService);
  private readonly teamsService = inject(TeamsService);
  private readonly router = inject(Router);

  readonly createTeamDialog = viewChild<CreateTeamDialogComponent>('createTeamDialog');

  // Context menu
  readonly contextMenuItems = signal<MenuItem[]>([]);

  readonly teamId = input<string | null>(null);
  readonly searchQuery = signal('');
  readonly filterType = signal<FilterType>('all');
  readonly displayMode = this.themeService.displayMode;
  readonly loading = signal(false);

  private readonly allTeams = signal<TeamListItem[]>([]);

  readonly filterOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Propriétaire', value: 'owned' },
    { label: 'Membre', value: 'member' }
  ];

  constructor() {
    // Load teams on init
    effect(() => {
      this.loadTeams();
    }, { allowSignalWrites: true });
  }

  readonly filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.filterType();
    let teams = this.allTeams();

    // Filter by role (admin = owner/co-owner)
    if (filter === 'owned') {
      teams = teams.filter(t => t.myRole === 'admin');
    } else if (filter === 'member') {
      teams = teams.filter(t => t.myRole === 'member');
    }

    // Filter by search query
    if (query) {
      teams = teams.filter(team =>
        team.name.toLowerCase().includes(query) ||
        (team.description?.toLowerCase().includes(query) ?? false)
      );
    }

    return teams;
  });

  readonly teamsCount = computed(() => this.filteredTeams().length);

  private loadTeams(): void {
    this.loading.set(true);
    this.teamsService.listMyTeams().subscribe({
      next: (teams) => {
        this.allTeams.set(teams);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.loading.set(false);
      }
    });
  }

  getTeamPath(teamId: string): string {
    return `/teams/${teamId}`;
  }

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

  openCreateTeamDialog(): void {
    this.createTeamDialog()?.open();
  }

  onTeamCreated(result: CreateTeamResult): void {
    // Reload teams after creation
    this.teamsService.createTeam({
      name: result.name,
      description: result.description
    }).subscribe({
      next: () => this.loadTeams(),
      error: (error) => console.error('Error creating team:', error)
    });
  }

  // Context menu methods
  buildContextMenu(id: string, name: string): MenuItem[] {
    return [
      {
        label: 'Voir',
        icon: 'fa-duotone fa-solid fa-eye',
        command: () => this.router.navigate(['/teams', id])
      },
      {
        label: 'Modifier',
        icon: 'fa-duotone fa-solid fa-pen'
      },
      { separator: true },
      {
        label: 'Supprimer',
        icon: 'fa-duotone fa-solid fa-trash',
        command: () => this.deleteTeam(id)
      }
    ];
  }

  onContextMenu(event: MouseEvent, id: string, name: string): void {
    event.preventDefault();
    this.contextMenuItems.set(this.buildContextMenu(id, name));
  }

  private deleteTeam(teamId: string): void {
    this.teamsService.deleteTeam(teamId).subscribe({
      next: () => this.loadTeams(),
      error: (error) => console.error('Error deleting team:', error)
    });
  }

  // Generate a color based on team name (deterministic)
  getTeamColor(teamName: string): string {
    const colors = ['#8b5cf6', '#f472b6', '#22d3ee', '#4ade80', '#fb923c', '#a78bfa'];
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
      hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}

import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewComponent, DataViewColumn } from '../../../../shared/components';

export interface Team {
  id: number;
  name: string;
  description: string;
  membersCount: number;
  createdAt: Date;
  parentId: number | null;
}

// Équipes racines (parentId = null) - cohérent avec members-tab.ts
const MOCK_TEAMS: Team[] = [
  {
    id: 1,
    name: 'Tech',
    description: 'Département technique',
    membersCount: 15,
    createdAt: new Date('2024-01-15'),
    parentId: null
  },
  {
    id: 2,
    name: 'Marketing',
    description: 'Département marketing',
    membersCount: 8,
    createdAt: new Date('2024-02-20'),
    parentId: null
  },
  {
    id: 3,
    name: 'RH',
    description: 'Ressources humaines',
    membersCount: 4,
    createdAt: new Date('2024-03-10'),
    parentId: null
  }
];

@Component({
  selector: 'app-teams-tab',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ButtonModule,
    CardModule,
    DataViewComponent
  ],
  templateUrl: './teams-tab.html',
  styleUrl: './teams-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsTabComponent {
  readonly searchQuery = signal('');
  private readonly teams = signal<Team[]>(MOCK_TEAMS);

  readonly columns: DataViewColumn[] = [
    { field: 'name', header: 'Nom' },
    { field: 'description', header: 'Description' },
    { field: 'membersCount', header: 'Membres', width: '100px' },
    { field: 'createdAt', header: 'Date de création', width: '150px' }
  ];

  readonly filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.teams();
    }
    return this.teams().filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.description.toLowerCase().includes(query)
    );
  });

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }
}

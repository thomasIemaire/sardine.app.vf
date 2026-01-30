import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DataViewComponent, DataViewColumn } from '../../../../../shared/components';

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  teamId: number;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  membersCount: number;
  parentId: number | null;
}

// Toutes les équipes (hiérarchie via parentId)
const MOCK_TEAMS: Team[] = [
  // Équipes racines (parentId = null)
  { id: 1, name: 'Tech', description: 'Département technique', membersCount: 15, parentId: null },
  { id: 2, name: 'Marketing', description: 'Département marketing', membersCount: 8, parentId: null },
  { id: 3, name: 'RH', description: 'Ressources humaines', membersCount: 4, parentId: null },

  // Sous-équipes de Tech (id: 1)
  { id: 101, name: 'Frontend', description: 'Développement frontend', membersCount: 4, parentId: 1 },
  { id: 102, name: 'Backend', description: 'Développement backend', membersCount: 5, parentId: 1 },
  { id: 103, name: 'DevOps', description: 'Infrastructure et déploiement', membersCount: 3, parentId: 1 },

  // Sous-équipes de Frontend (id: 101)
  { id: 1011, name: 'Design System', description: 'Composants UI réutilisables', membersCount: 2, parentId: 101 },
  { id: 1012, name: 'Web App', description: 'Application web principale', membersCount: 2, parentId: 101 },

  // Sous-équipes de Backend (id: 102)
  { id: 1021, name: 'API', description: 'Services REST et GraphQL', membersCount: 3, parentId: 102 },
  { id: 1022, name: 'Data', description: 'Base de données et analytics', membersCount: 2, parentId: 102 },

  // Sous-équipes de Marketing (id: 2)
  { id: 201, name: 'Digital', description: 'Marketing digital et SEO', membersCount: 4, parentId: 2 },
  { id: 202, name: 'Communication', description: 'Communication externe', membersCount: 3, parentId: 2 },

  // Sous-équipes de Digital (id: 201)
  { id: 2011, name: 'SEO', description: 'Référencement naturel', membersCount: 2, parentId: 201 },
  { id: 2012, name: 'Ads', description: 'Publicité payante', membersCount: 2, parentId: 201 }
];

// Tous les membres avec leur teamId
const MOCK_MEMBERS: Member[] = [
  // Membres de Tech (id: 1)
  { id: 1, firstName: 'Thomas', lastName: 'Lemaire', email: 'thomas.lemaire@example.com', role: 'admin', joinedAt: new Date('2024-01-15'), teamId: 1 },
  { id: 2, firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@example.com', role: 'member', joinedAt: new Date('2024-02-20'), teamId: 1 },

  // Membres de Frontend (id: 101)
  { id: 3, firstName: 'Pierre', lastName: 'Martin', email: 'pierre.martin@example.com', role: 'admin', joinedAt: new Date('2024-03-10'), teamId: 101 },
  { id: 4, firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@example.com', role: 'member', joinedAt: new Date('2024-04-05'), teamId: 101 },

  // Membres de Design System (id: 1011)
  { id: 5, firstName: 'Lucas', lastName: 'Petit', email: 'lucas.petit@example.com', role: 'admin', joinedAt: new Date('2024-05-01'), teamId: 1011 },
  { id: 6, firstName: 'Emma', lastName: 'Roux', email: 'emma.roux@example.com', role: 'member', joinedAt: new Date('2024-05-15'), teamId: 1011 },

  // Membres de Web App (id: 1012)
  { id: 7, firstName: 'Hugo', lastName: 'Moreau', email: 'hugo.moreau@example.com', role: 'admin', joinedAt: new Date('2024-06-01'), teamId: 1012 },
  { id: 8, firstName: 'Léa', lastName: 'Garcia', email: 'lea.garcia@example.com', role: 'member', joinedAt: new Date('2024-06-15'), teamId: 1012 },

  // Membres de Backend (id: 102)
  { id: 9, firstName: 'Antoine', lastName: 'Durand', email: 'antoine.durand@example.com', role: 'admin', joinedAt: new Date('2024-03-01'), teamId: 102 },
  { id: 10, firstName: 'Julie', lastName: 'Leroy', email: 'julie.leroy@example.com', role: 'member', joinedAt: new Date('2024-03-15'), teamId: 102 },

  // Membres de API (id: 1021)
  { id: 11, firstName: 'Maxime', lastName: 'Simon', email: 'maxime.simon@example.com', role: 'admin', joinedAt: new Date('2024-04-01'), teamId: 1021 },
  { id: 12, firstName: 'Camille', lastName: 'Laurent', email: 'camille.laurent@example.com', role: 'member', joinedAt: new Date('2024-04-15'), teamId: 1021 },

  // Membres de DevOps (id: 103)
  { id: 13, firstName: 'Nicolas', lastName: 'Michel', email: 'nicolas.michel@example.com', role: 'admin', joinedAt: new Date('2024-02-01'), teamId: 103 },
  { id: 14, firstName: 'Sarah', lastName: 'David', email: 'sarah.david@example.com', role: 'member', joinedAt: new Date('2024-02-15'), teamId: 103 },

  // Membres de Marketing (id: 2)
  { id: 15, firstName: 'Alexandre', lastName: 'Thomas', email: 'alexandre.thomas@example.com', role: 'admin', joinedAt: new Date('2024-01-01'), teamId: 2 },

  // Membres de Digital (id: 201)
  { id: 16, firstName: 'Charlotte', lastName: 'Robert', email: 'charlotte.robert@example.com', role: 'admin', joinedAt: new Date('2024-03-01'), teamId: 201 },
  { id: 17, firstName: 'Julien', lastName: 'Richard', email: 'julien.richard@example.com', role: 'member', joinedAt: new Date('2024-03-15'), teamId: 201 }
];

@Component({
  selector: 'app-members-tab',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule,
    DataViewComponent
  ],
  templateUrl: './members-tab.html',
  styleUrl: './members-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembersTabComponent {
  readonly teamId = input<string | null>(null);
  readonly viewMode = input<string>('users');
  readonly searchQuery = signal('');

  getTeamPath(teamId: number): string {
    return `/teams/${teamId}`;
  }

  private readonly allMembers = signal<Member[]>(MOCK_MEMBERS);
  private readonly allTeams = signal<Team[]>(MOCK_TEAMS);

  readonly membersColumns: DataViewColumn[] = [
    { field: 'fullName', header: 'Nom' },
    { field: 'email', header: 'Email' },
    { field: 'role', header: 'Rôle', width: '120px' },
    { field: 'joinedAt', header: "Date d'ajout", width: '150px' }
  ];

  readonly teamsColumns: DataViewColumn[] = [
    { field: 'name', header: 'Nom' },
    { field: 'description', header: 'Description' },
    { field: 'membersCount', header: 'Membres', width: '100px' }
  ];

  // Membres de l'équipe actuelle
  readonly teamMembers = computed(() => {
    const currentTeamId = Number(this.teamId());
    if (!currentTeamId) return [];
    return this.allMembers().filter(m => m.teamId === currentTeamId);
  });

  // Équipes enfants de l'équipe actuelle
  readonly childTeams = computed(() => {
    const currentTeamId = Number(this.teamId());
    if (!currentTeamId) return [];
    return this.allTeams().filter(t => t.parentId === currentTeamId);
  });

  readonly filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const members = this.teamMembers();
    if (!query) return members;
    return members.filter(member =>
      member.firstName.toLowerCase().includes(query) ||
      member.lastName.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  });

  readonly filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const teams = this.childTeams();
    if (!query) return teams;
    return teams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.description.toLowerCase().includes(query)
    );
  });

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  getRoleSeverity(role: Member['role']): 'success' | 'info' | 'secondary' {
    switch (role) {
      case 'admin':
        return 'success';
      case 'member':
        return 'info';
      case 'viewer':
        return 'secondary';
    }
  }

  getRoleLabel(role: Member['role']): string {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Membre';
      case 'viewer':
        return 'Lecteur';
    }
  }
}

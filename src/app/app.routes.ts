import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layouts';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'automation',
        pathMatch: 'full'
      },
      {
        path: 'automation',
        loadComponent: () => import('./pages/automation/automation').then(m => m.AutomationComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./pages/documents/documents').then(m => m.DocumentsComponent)
      },
      {
        path: 'documents/folders/:id',
        loadComponent: () => import('./pages/documents/folder-detail/folder-detail').then(m => m.FolderDetailComponent)
      },
      {
        path: 'contacts',
        loadComponent: () => import('./pages/contacts/contacts').then(m => m.ContactsComponent)
      },
      {
        path: 'teams',
        loadComponent: () => import('./pages/teams/teams').then(m => m.TeamsComponent)
      },
      {
        path: 'teams/:id',
        loadComponent: () => import('./pages/teams/team-detail/team-detail').then(m => m.TeamDetailComponent)
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
      }
    ]
  }
];

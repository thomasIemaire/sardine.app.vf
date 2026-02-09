import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
                data: { breadcrumb: 'Accueil' },
            },
            {
                path: 'automation',
                data: { breadcrumb: 'Automatisation' },
                children: [
                    {
                        path: 'docs',
                        loadComponent: () => import('./pages/automation/docs/docs').then(m => m.AutomationDocsComponent),
                        data: { breadcrumb: 'Documentation' },
                    },
                    {
                        path: '',
                        loadComponent: () => import('./pages/automation/automation').then(m => m.AutomationComponent),
                        children: [
                            { path: '', redirectTo: 'agents', pathMatch: 'full' },
                            {
                                path: 'agents',
                                loadComponent: () => import('./pages/automation/agents/agents').then(m => m.AgentsComponent),
                                data: { breadcrumb: 'Agents' },
                            },
                            {
                                path: 'flows',
                                loadComponent: () => import('./pages/automation/flows/flows').then(m => m.FlowsComponent),
                                data: { breadcrumb: 'Flows' },
                            },
                        ],
                    },
                ],
            },
            {
                path: 'documents',
                data: { breadcrumb: 'Documents' },
                loadComponent: () => import('./pages/documents/documents').then(m => m.DocumentsComponent),
            },
            {
                path: 'organization',
                data: { breadcrumb: 'Organisation' },
                loadComponent: () => import('./pages/organization/organization').then(m => m.OrganizationComponent),
                children: [
                    { path: '', redirectTo: 'members', pathMatch: 'full' },
                    {
                        path: 'members',
                        loadComponent: () => import('./pages/organization/members/members').then(m => m.MembersComponent),
                        data: { breadcrumb: 'Membres' },
                    },
                    {
                        path: 'clients',
                        loadComponent: () => import('./pages/organization/organizations/organizations').then(m => m.OrganizationsComponent),
                        data: { breadcrumb: 'Clients' },
                    },
                ],
            },
        ],
    },
    {
        path: 'auth',
        component: AuthLayoutComponent,
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes),
    },
];

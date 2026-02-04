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
            },
        ],
    },
    {
        path: 'auth',
        component: AuthLayoutComponent,
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes),
    },
];

import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
    {
        path: 'auth',
        component: AuthLayoutComponent,
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes),
    },
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
    },
];

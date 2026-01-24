import { Routes } from '@angular/router';
import { LOCAL_ROUTES } from '@app/utils/routes';

export default [
    {
        path: '',
        redirectTo: LOCAL_ROUTES.DASHBOARD,
        pathMatch: 'full'
    },
    {
        path: LOCAL_ROUTES.DASHBOARD,
        loadComponent: () =>
            import('./dashboard/dashboard.component').then((m) => m.DashboardComponent)
    },
    {
        path: LOCAL_ROUTES.TENANTS,
        loadComponent: () =>
            import('./tenants/tenants.component').then((m) => m.TenantsComponent)
    },
    {
        path: LOCAL_ROUTES.EDITIONS,
        loadComponent: () =>
            import('./editions/editions.component').then((m) => m.EditionsComponent)
    }
] as Routes;

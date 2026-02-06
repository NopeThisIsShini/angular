import { Routes } from '@angular/router';
import { LOCAL_ROUTES } from '@/app/utils/routes';
import { TenantsComponent } from './tenants/tenants.component';

export default [
    { path: '', redirectTo: LOCAL_ROUTES.TENANTS, pathMatch: 'full' },
    { path: LOCAL_ROUTES.TENANTS, component: TenantsComponent }
] as Routes;

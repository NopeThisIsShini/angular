import { Routes } from '@angular/router';
import { LOCAL_ROUTES } from '@app/utils/routes';
import { TenantsComponent } from './tenants/tenants.component';
import { EditionsComponent } from './editions/editions.component';

export default [
    { path: '', redirectTo: LOCAL_ROUTES.TENANTS, pathMatch: 'full' },
    { path: LOCAL_ROUTES.TENANTS, component: TenantsComponent },
    { path: LOCAL_ROUTES.EDITIONS, component: EditionsComponent }
] as Routes;

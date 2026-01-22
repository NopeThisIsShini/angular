import { Routes } from '@angular/router';
import { LOCAL_ROUTES } from '../../utils/routes/local.route';

export default [
    { path: '', redirectTo: LOCAL_ROUTES.ROLE, pathMatch: 'full' },
    { path: LOCAL_ROUTES.ROLE, loadComponent: () => import('./components/role/role.component').then((m) => m.RoleComponent) },
    { path: LOCAL_ROUTES.USER, loadComponent: () => import('./components/user/user.component').then((m) => m.UserComponent) }
] as Routes;

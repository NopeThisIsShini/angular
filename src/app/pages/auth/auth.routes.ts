import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LOCAL_ROUTES } from '@app/utils/routes';

export default [
    { path: '', redirectTo: LOCAL_ROUTES.LOGIN, pathMatch: 'full' },
    { path: LOCAL_ROUTES.LOGIN, component: LoginComponent }
] as Routes;

import { Routes } from '@angular/router';
import { LOCAL_ROUTES } from '../../utils/routes';
import { AccountComponent } from './components/account/account.component';

export default [
    {
        path: '',
        component: AccountComponent,
        data: { breadcrumb: 'Account' },
        children: [
            {
                path: '',
                redirectTo: LOCAL_ROUTES.PROFILE,
                pathMatch: 'full'
            },
            {
                path: LOCAL_ROUTES.PROFILE,
                loadComponent: () => import('./components/profile/profile.component').then((m) => m.ProfileComponent),
                data: { breadcrumb: 'Profile' }
            },
            {
                path: LOCAL_ROUTES.SMTP,
                loadComponent: () => import('./components/smtp/smtp.component').then((m) => m.SmtpComponent),
                data: { breadcrumb: 'SMTP' }
            }
        ]
    }
] as Routes;

import { Routes } from '@angular/router';
import { Landing } from '@app/pages/landing/landing';
import { AppLayout } from '@app/layout/component/app.layout';
import { LOCAL_ROUTES } from '@app/utils/routes';
import { authGuard } from '@app/utils/guard';

export const appRoutes: Routes = [
    // {
    //     path: '',
    //     component: Landing
    // },
    {
        path: '',
        component: AppLayout    ,
        // canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: LOCAL_ROUTES.ACCOUNT,
                pathMatch: 'full'
            },
            {
                path: LOCAL_ROUTES.ADMINISTRATION,
                loadChildren: () => import('./app/pages/administration/administration.routes')
            },
            {
                path: LOCAL_ROUTES.ACCOUNT,
                loadChildren: () => import('./app/pages/account/account.routes')
            }
        ]
    },

    {
        path: LOCAL_ROUTES.AUTH,
        loadChildren: () => import('./app/pages/auth/auth.routes')
    },
    
    { path: '**', redirectTo: 'notfound' }
];

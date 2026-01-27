import { Injectable, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PermissionService } from '@app/shared/services';
import { LOCAL_ROUTES } from '@app/utils/routes';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private permissionService = inject(PermissionService);

    getMenuModel(): MenuItem[] {
        const model = [
            {
                items: [
                    {
                        label: 'Administration',
                        icon: 'icon-admin',
                        items: [
                            {
                                label: 'Roles',
                                icon: 'icon-roles',
                                routerLink: [`${LOCAL_ROUTES.ADMINISTRATION}/${LOCAL_ROUTES.ROLE}`]
                            },
                            {
                                 label: 'Users',
                                 icon: 'icon-users',
                                 routerLink: [`${LOCAL_ROUTES.ADMINISTRATION}/${LOCAL_ROUTES.USER}`]
                             }
                         ]
                     },
                     {
                         label: 'Host',
                         icon: 'icon-host',
                         items: [
                             {
                                 label: 'Tenants',
                                 icon: 'icon-tenants',
                                 routerLink: [`/${LOCAL_ROUTES.HOST}/${LOCAL_ROUTES.TENANTS}`]
                             },
                             {
                                 label: 'Editions',
                                 icon: 'pi pi-fw pi-star',
                                 routerLink: [`/${LOCAL_ROUTES.HOST}/${LOCAL_ROUTES.EDITIONS}`]
                             }
                         ]
                     }
                 ]
             }
        ];

        return this.filterMenu(model);
    }

    private filterMenu(items: any[]): any[] {
        return items
            .map((item) => {
                const cloned = { ...item };

                if (cloned.items) {
                    cloned.items = this.filterMenu(cloned.items);
                }

                if (cloned.routerLink) {
                    const key = this.mapRouterToPermission(cloned.routerLink[0]);
                    if (!this.permissionService.hasPermission(key)) {
                        return null;
                    }
                }

                if (cloned.items && cloned.items.length === 0 && !cloned.routerLink && !cloned.separator) {
                    return null;
                }

                return cloned;
            })
            .filter(Boolean);
    }

    private mapRouterToPermission(router: string): string {
        const key = router.replace(/^\//, '').replace(/\//g, '.');
        return key + '.view';
    }
}

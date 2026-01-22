import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { PermissionService } from '@app/shared/services';
import { LOCAL_ROUTES } from '@app/utils/routes';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit{
    model: MenuItem[] = [];

    permissionService = inject(PermissionService);

    ngOnInit() {
        this.loadModels();
        // this.model = this.filterMenu(this.model);
    }

    loadModels() {
        this.model = [
            {
                items: [
                    {
                        label: 'Administration',
                        icon: 'pi pi-fw pi-shield',
                        items: [
                            {
                                label: 'Roles',
                                icon: 'pi pi-fw pi-sitemap',
                                routerLink: [`${LOCAL_ROUTES.ADMINISTRATION}/${LOCAL_ROUTES.ROLE}`]
                            },
                            {
                                label: 'Users',
                                icon: 'pi pi-fw pi-users',
                                routerLink: [`${LOCAL_ROUTES.ADMINISTRATION}/${LOCAL_ROUTES.USER}`]
                            }
                        ]
                    },
                   
                ]
            }
        ];
    }

    filterMenu(items: any[]): any[] {
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

    mapRouterToPermission(router: string): string {
        const key = router.replace(/^\//, '').replace(/\//g, '.');
        return key + '.read';
    }
}

import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuService } from '../service/menu.service';
import { AppPopupMenuitem } from './app.popup-menuitem';

@Component({
    selector: 'app-horizontal-menu',
    standalone: true,
    imports: [CommonModule, RouterModule, AppPopupMenuitem],
    template: `
        <ul class="layout-menu">
            @for (item of menuItems(); track $index) {
                @if (item.visible !== false) {
                    <li app-popup-menuitem [item]="item" [iconOnly]="iconOnly()" class="layout-root-menuitem"></li>
                }
            }
        </ul>
    `,
    host: {
        class: 'layout-horizontal-menu'
    }
})
export class AppHorizontalMenu {
    iconOnly = input<boolean>(false);
    
    private menuService = inject(MenuService);
    private router = inject(Router);

    menuItems = computed(() => {
        const fullMenu = this.menuService.menuModel();
        const rawItems = fullMenu.length > 0 ? (fullMenu[0].items || []) : [];
        return this.transformMenuItems(rawItems);
    });

    constructor() {}

    private transformMenuItems(items: MenuItem[]): MenuItem[] {
        return items.map((item) => {
            const newItem = { ...item };
            if (newItem.routerLink) {
                const link = Array.isArray(newItem.routerLink) ? newItem.routerLink[0] : newItem.routerLink;
                newItem.command = () => this.router.navigateByUrl(link);
            }
            if (newItem.items) {
                newItem.items = this.transformMenuItems(newItem.items);
            }
            return newItem;
        });
    }
}

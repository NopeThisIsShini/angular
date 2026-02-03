import { Component, inject, OnInit } from '@angular/core';
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
            @for (item of menuItems; track i; let i = $index) {
                @if (item.visible !== false) {
                    <li app-popup-menuitem [item]="item" class="layout-root-menuitem"></li>
                }
            }
        </ul>
    `,
    host: {
        class: 'layout-horizontal-menu'
    }
})
export class AppHorizontalMenu implements OnInit {
    menuItems: MenuItem[] = [];
    menuService = inject(MenuService);
    router = inject(Router);

    ngOnInit() {
        const fullMenu = this.menuService.getMenuModel();
        const rawItems = fullMenu.length > 0 ? (fullMenu[0].items || []) : [];
        this.menuItems = this.transformMenuItems(rawItems);
    }

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

import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { MenuService } from '../service/menu.service';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AppConfigurator } from '@/app/layout/component/app.configurator';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, BreadcrumbModule, TieredMenuModule, AppConfigurator],
    template: `
        <div class="layout-topbar">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="icon-bars"></i>
            </button>

            <div class="layout-topbar-breadcrumb hidden lg:block">
                <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem" />
            </div>

            <div class="layout-topbar-actions">
                <!-- Desktop Actions -->
                <div class="layout-topbar-menu lg:flex hidden items-center">
                    <ng-container *ngTemplateOutlet="topbarActions"></ng-container>
                </div>
                 <div class="layout-config-menu">
                <div class="relative">


                    <button
                        class="config-button"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <svg class="config-button-border" xmlns="http://www.w3.org/2000/svg">
                            <rect rx="0.75rem" ry="0.75rem" pathLength="100"></rect>
                        </svg>
                        <i class="icon-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

                <!-- Mobile Menu Toggle -->
                <button
                    class="layout-topbar-menu-button layout-topbar-action lg:hidden"
                    pStyleClass="#topbar-mobile-menu"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                >
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <!-- Mobile Menu Container -->
                <div id="topbar-mobile-menu" class="layout-topbar-menu hidden lg:hidden">
                    <div class="layout-topbar-menu-content">
                        <ng-container *ngTemplateOutlet="topbarActions"></ng-container>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reusable Actions Template -->
        <ng-template #topbarActions>
            <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                <i [ngClass]="{ 'icon-moon': layoutService.isDarkTheme(), 'icon-sun': !layoutService.isDarkTheme() }"></i>
                <span>Theme</span>
            </button>
            <button type="button" class="layout-topbar-action">
                <i class="icon-alert"></i>
                <span>Notifications</span>
            </button>
        </ng-template>
    `
})
export class AppTopbar {
    breadcrumbItems: MenuItem[] = [];
    homeItem: MenuItem = { icon: 'icon-home', routerLink: '/' };
    menuItems: MenuItem[] = [];

    menuService = inject(MenuService);

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: Event) => {
            this.breadcrumbItems = this.createBreadcrumbs(this.activatedRoute.root);
        });

        const fullMenu = this.menuService.getMenuModel();
        this.menuItems = fullMenu.length > 0 ? this.transformMenuItems(fullMenu[0].items || []) : [];
    }

    transformMenuItems(items: MenuItem[]): MenuItem[] {
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

    createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: MenuItem[] = []): MenuItem[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map((segment) => segment.path).join('/');
            if (routeURL !== '') {
                url += `/${routeURL}`;
            }

            const label = child.snapshot.data['breadcrumb'] || routeURL;
            if (label && routeURL !== '') {
                breadcrumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), routerLink: url });
            }

            return this.createBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}

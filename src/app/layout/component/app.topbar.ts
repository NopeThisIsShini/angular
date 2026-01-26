import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, BreadcrumbModule],
    template: ` <div class="layout-topbar">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
            <i class="icon-bars"></i>
        </button>

        <div class="layout-topbar-breadcrumb hidden lg:block">
            <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem" />
        </div>

        <div class="layout-topbar-actions">
            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'icon-moon': layoutService.isDarkTheme(), 'icon-sun': !layoutService.isDarkTheme() }"></i>
                        <span>Theme</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="icon-alert"></i>
                        <span>Notifications</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    breadcrumbItems: MenuItem[] = [];
    homeItem: MenuItem = { icon: 'icon-home', routerLink: '/' };

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: Event) => {
            this.breadcrumbItems = this.createBreadcrumbs(this.activatedRoute.root);
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

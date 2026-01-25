import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '@app/pages/services';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AvatarModule, MenuModule],
    template: ` <div class="layout-topbar">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <div class="layout-topbar-actions">
            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                        <span>Theme</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-bell"></i>
                        <span>Notifications</span>
                    </button>
                    
                    <div class="layout-topbar-user" (click)="menu.toggle($event)">
                        <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
                        <div class="layout-topbar-user-info">
                            <span class="layout-topbar-user-name">Totok Michael</span>
                            <span class="layout-topbar-user-email">tmichael20mail.com</span>
                        </div>
                        <i class="pi pi-chevron-down" [ngClass]="{ 'rotate-180': isUserMenuOpen }" style="font-size: 0.8rem; margin-left: 0.5rem; color: var(--text-color-secondary); transition: transform 0.2s"></i>
                    </div>
                    <p-menu #menu [model]="userMenuItems" [popup]="true" appendTo="body" (onShow)="isUserMenuOpen = true" (onHide)="isUserMenuOpen = false" />
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    isUserMenuOpen = false;
    userMenuItems: MenuItem[] = [
        {
            items: [
                { label: 'Account', icon: 'pi pi-user', command: () => this.authService.logout() },
                { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
            ]
        }
    ];

    constructor(public layoutService: LayoutService, private authService: AuthService) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}

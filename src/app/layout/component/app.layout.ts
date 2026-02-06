import { Component, Renderer2, viewChild, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AppTopbar } from './app.topbar';
import { AppSidebar } from './app.sidebar';
import { LayoutService } from '../service/layout.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, AppTopbar, AppSidebar, RouterModule],
    template: `
        <div class="layout-wrapper" [ngClass]="containerClass()">
            <app-topbar></app-topbar>
            <app-sidebar></app-sidebar>
            <div class="layout-main-container">
                <div class="layout-main">
                    <router-outlet></router-outlet>
                </div>
            </div>
            <div class="layout-mask animate-fadein"></div>
        </div> 
    `
})
export class AppLayout {
    private layoutService = inject(LayoutService);
    private renderer = inject(Renderer2);
    private router = inject(Router);

    private menuOutsideClickListener: any;

    appSidebar = viewChild(AppSidebar);
    appTopBar = viewChild(AppTopbar);

    // Signals
    navEnd = toSignal(this.router.events.pipe(filter((event) => event instanceof NavigationEnd)));

    containerClass = computed(() => {
        const config = this.layoutService.layoutConfig();
        const state = this.layoutService.state();
        
        return {
            'layout-overlay': config.menuMode === 'overlay',
            'layout-static': config.menuMode === 'static',
            'layout-horizontal': this.layoutService.isHorizontal(),
            'layout-slim': this.layoutService.isSlim(),
            'layout-static-inactive': state.staticMenuDesktopInactive && config.menuMode === 'static',
            'layout-overlay-active': state.overlayMenuActive,
            'layout-mobile-active': state.staticMenuMobileActive
        };
    });

    constructor() {
        // Reactive Menu Mask & Click Listener
        effect(() => {
            const state = this.layoutService.state();
            const overlayOpen = state.overlayMenuActive || state.staticMenuMobileActive;

            if (overlayOpen) {
                if (!this.menuOutsideClickListener) {
                    this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                        if (this.isOutsideClicked(event)) {
                            this.hideMenu();
                        }
                    });
                }
            } else {
                this.removeClickListener();
            }

            if (state.staticMenuMobileActive) {
                this.blockBodyScroll();
            } else {
                this.unblockBodyScroll();
            }
        });

        // Hide menu on navigation
        effect(() => {
            if (this.navEnd()) {
                this.hideMenu();
            }
        });
    }

    private isOutsideClicked(event: MouseEvent) {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarEl = document.querySelector('.layout-menu-button');
        const eventTarget = event.target as Node;

        return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
    }

    private hideMenu() {
        this.layoutService.hideMenu();
        this.removeClickListener();
        this.unblockBodyScroll();
    }

    private removeClickListener() {
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
    }

    private blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        }
    }

    private unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        }
    }

    ngOnDestroy() {
        this.removeClickListener();
    }
}

import { Injectable, effect, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';

export interface layoutConfig {
    preset: string;
    primary: string;
    surface: string;
    darkTheme: boolean;
    menuMode: 'static' | 'overlay';
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    layoutConfig = signal<layoutConfig>({
        preset: 'Aura',
        primary: 'custom',
        surface: 'slate',
        darkTheme: false,
        menuMode: 'static'
    });

    layoutState = signal<LayoutState>({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    });

    private overlayOpen = new Subject<any>();
    private menuSource = new Subject<MenuChangeEvent>();
    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'dark' : 'light'));
    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);
    isDarkTheme = computed(() => this.layoutConfig().darkTheme);
    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

    transitionComplete = signal<boolean>(false);
    private initialized = false;

    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }
            this.handleDarkModeTransition(config);
        });
    }

    loadInitialConfig(config: Partial<layoutConfig>): void {
        this.layoutConfig.set({
            preset: 'Aura',
            primary: 'custom',
            surface: 'slate',
            darkTheme: config.darkTheme ?? false,
            menuMode: config.menuMode ?? 'static'
        });
    }

    updateConfig(partialConfig: Partial<layoutConfig>): void {
        this.layoutConfig.update((current) => ({
            ...current,
            darkTheme: partialConfig.darkTheme ?? current.darkTheme,
            menuMode: partialConfig.menuMode ?? current.menuMode,
            preset: 'Aura',
            primary: 'custom',
            surface: 'slate'
        }));
    }

    toggleDarkMode(isDark?: boolean): void {
        const shouldBeDark = isDark ?? !this.layoutConfig().darkTheme;
        this.layoutConfig.update((current) => ({
            ...current,
            darkTheme: shouldBeDark
        }));
    }

    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            this.applyDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.applyDarkMode(config);
        });

        transition.ready.then(() => {
            this.onTransitionEnd();
        }).catch(() => { });
    }

    private applyDarkMode(config: layoutConfig): void {
        if (config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => this.transitionComplete.set(false));
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({
                ...prev,
                overlayMenuActive: !prev.overlayMenuActive
            }));
            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuDesktopInactive: !prev.staticMenuDesktopInactive
            }));
        } else {
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuMobileActive: !prev.staticMenuMobileActive
            }));
            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }
}

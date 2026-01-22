import { Injectable, effect, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';

export interface layoutConfig {
    preset: string;
    primary: string;
    surface: string;
    darkTheme: boolean;
    menuMode: string;
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
    // Fixed configuration with your custom colors
    private _config: layoutConfig = {
        preset: 'Aura',
        primary: 'custom-blue',
        surface: 'slate',
        darkTheme: false,
        menuMode: 'static'
    };

    private _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);
    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();
    private overlayOpen = new Subject<any>();
    private menuSource = new Subject<MenuChangeEvent>();
    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();

    // Computed properties
    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'dark' : 'light'));
    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);
    isDarkTheme = computed(() => this.layoutConfig().darkTheme);

    // These return fixed values since we're not allowing color changes
    getPrimary = computed(() => 'custom-blue');
    getSurface = computed(() => 'slate');

    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');
    transitionComplete = signal<boolean>(false);

    private initialized = false;

    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
            }
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });
    }

    /**
     * Load initial configuration - simplified to only allow certain changes
     */
    loadInitialConfig(config: Partial<layoutConfig>): void {
        // Only allow darkTheme and menuMode to be changed
        this._config = {
            preset: 'Aura',
            primary: 'custom-blue',
            surface: 'slate',
            darkTheme: config.darkTheme ?? false,
            menuMode: config.menuMode ?? 'static'
        };
        this.layoutConfig.set(this._config);
    }

    /**
     * Get the current configuration
     */
    getConfig(): layoutConfig {
        return { ...this.layoutConfig() };
    }

    /**
     * Update only allowed configuration properties (darkTheme and menuMode)
     */
    updateConfig(partialConfig: Partial<layoutConfig>): void {
        this.layoutConfig.update((current) => ({
            ...current,
            // Only allow these properties to be updated
            darkTheme: partialConfig.darkTheme ?? current.darkTheme,
            menuMode: partialConfig.menuMode ?? current.menuMode,
            // Keep these fixed
            preset: 'Aura',
            primary: 'custom-blue',
            surface: 'slate'
        }));
    }

    /**
     * Reset to default configuration with your custom colors
     */
    resetToDefault(): void {
        const defaultConfig: layoutConfig = {
            preset: 'Aura',
            primary: 'custom-blue',
            surface: 'slate',
            darkTheme: false,
            menuMode: 'static'
        };
        this.loadInitialConfig(defaultConfig);
    }

    /**
     * Toggle only dark mode (the only theme change allowed)
     */
    toggleDarkMode(isDark?: boolean): void {
        const shouldBeDark = isDark ?? !this.layoutConfig().darkTheme;

        this.layoutConfig.update((current) => ({
            ...current,
            darkTheme: shouldBeDark
        }));

        if (shouldBeDark) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
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

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            })
            .catch(() => {});
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
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({
                ...prev,
                overlayMenuActive: !this.layoutState().overlayMenuActive
            }));

            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive
            }));
        } else {
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuMobileActive: !this.layoutState().staticMenuMobileActive
            }));

            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    private onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }
}

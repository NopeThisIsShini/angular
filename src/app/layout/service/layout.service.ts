import { Injectable, effect, Signal, computed, signal } from '@angular/core';
import { SignalStore } from '@/app/store/signal-store';

export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    menuMode?: 'static' | 'overlay' | 'horizontal' | 'slim';
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
    layoutConfig: layoutConfig;
    features: any;
    activeMenuKey: string | null;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService extends SignalStore<LayoutState> {
    // Selectors
    readonly layoutConfig = this.select((s) => s.layoutConfig);
    readonly features = this.select((s) => s.features);
    readonly activeMenuKey = this.select((s) => s.activeMenuKey);
    
    readonly theme = computed(() => (this.layoutConfig()?.darkTheme ? 'light' : 'dark'));
    readonly isSidebarActive = this.select((s) => s.overlayMenuActive || s.staticMenuMobileActive);
    readonly isDarkTheme = this.select((s) => s.layoutConfig.darkTheme);
    readonly getPrimary = this.select((s) => s.layoutConfig.primary);
    readonly getSurface = this.select((s) => s.layoutConfig.surface);
    readonly isOverlay = this.select((s) => s.layoutConfig.menuMode === 'overlay');
    readonly isHorizontal = this.select((s) => s.layoutConfig.menuMode === 'horizontal');
    readonly isSlim = this.select((s) => s.layoutConfig.menuMode === 'slim');

    transitionComplete = signal<boolean>(false);
    overlayOpened = signal<number>(0); // Timestamp/counter to trigger overlay effects

    private innerWidth = signal(window.innerWidth);
    private initialized = false;

    constructor() {
        super({
            staticMenuDesktopInactive: false,
            overlayMenuActive: false,
            configSidebarVisible: false,
            staticMenuMobileActive: false,
            menuHoverActive: false,
            activeMenuKey: null,
            layoutConfig: (window as any).appUiConfig?.layoutConfig || {
                preset: 'Aura',
                primary: 'emerald',
                surface: null,
                darkTheme: true,
                menuMode: 'static'
            },
            features: (window as any).appUiConfig?.features || {
                showConfigOptions: false,
                allowMenuModeChange: false,
                allowThemeChange: false
            }
        });

        window.addEventListener('resize', () => {
            this.innerWidth.set(window.innerWidth);
            if (this.isDesktop() && this.state().staticMenuMobileActive) {
                this.patchState({ staticMenuMobileActive: false });
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

    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            })
            .catch(() => { });
    }

    toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
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
        const state = this.state();
        if (this.isOverlay()) {
            this.patchState({ overlayMenuActive: !state.overlayMenuActive });

            if (this.state().overlayMenuActive) {
                this.overlayOpened.set(Date.now());
            }
        }

        if (this.isDesktop()) {
            this.patchState({ staticMenuDesktopInactive: !state.staticMenuDesktopInactive });
        } else {
            this.patchState({ staticMenuMobileActive: !state.staticMenuMobileActive });

            if (this.state().staticMenuMobileActive) {
                this.overlayOpened.set(Date.now());
            }
        }
    }

    toggleMenuMode(): void {
        this.patchState((s) => ({
            layoutConfig: {
                ...s.layoutConfig,
                menuMode: s.layoutConfig.menuMode === 'horizontal' ? 'static' : 'horizontal'
            }
        }));
    }

    setDarkMode(darkTheme: boolean): void {
        this.patchState((s) => ({
            layoutConfig: {
                ...s.layoutConfig,
                darkTheme
            }
        }));
    }

    updateLayoutConfig(config: Partial<layoutConfig>): void {
        this.patchState((s) => ({
            layoutConfig: {
                ...s.layoutConfig,
                ...config
            }
        }));
    }

    isDesktop() {
        return this.innerWidth() > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.patchState({ activeMenuKey: event.key });
    }

    hideMenu(): void {
        this.patchState({
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        });
    }

    override reset() {
        this.patchState({ activeMenuKey: null });
    }
}

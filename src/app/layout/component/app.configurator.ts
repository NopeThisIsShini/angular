import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnChanges, OnInit, Output, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { $t } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { PrimeNG } from 'primeng/config';
import { Drawer } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LayoutService } from '../service/layout.service';
import { ConfigService } from '@app/shared/services';

// Updated custom color palette with on primary black
const CUSTOM_PRIMARY_PALETTE = {
    50: '#f5f5f5',
    100: '#e0e0e0',
    200: '#c2c2c2',
    300: '#a3a3a3',
    400: '#858585',
    500: '#666666', // primary medium
    600: '#4d4d4d',
    700: '#333333', // primary dark
    800: '#1a1a1a',
    900: '#0d0d0d', // on primary black
    950: '#000000' // true black
};

const FIXED_SURFACE_PALETTE = {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
};

@Component({
    selector: 'app-configurator',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectButtonModule, Drawer, ButtonModule],
    template: `
        <p-drawer #drawerRef [(visible)]="openSetting" position="right" (onHide)="closeCallback()">
            <ng-template #headless>
                <div class="flex flex-col h-full p-3">
                    <div class="flex items-center justify-between pt-4 shrink-0">
                        <span class="inline-flex items-center gap-2 bg-[var(--surface-ground)] p-2 rounded-md">
                            <i class="pi pi-palette text-[var(--primary-color)]" style="font-size: 1.2rem"></i>
                            <span class="text-2xl">Settings</span>
                        </span>
                        <span>
                            <p-button type="button" (click)="closeCallback()" icon="pi pi-times" rounded="true" outlined="true" styleClass="h-8 w-8"></p-button>
                        </span>
                    </div>

                    <div class="flex flex-col p-2 gap-4 overflow-auto">
                        <!-- Color Scheme Toggle (Dark/Light only) -->
                        <div class="flex flex-col gap-2">
                            <span class="text-sm text-muted-color font-semibold">Color Scheme</span>
                            <p-selectbutton [ngModel]="colorScheme()" (ngModelChange)="onColorSchemeChange($event)" [options]="colorSchemeOptions" [allowEmpty]="false" size="small" />
                        </div>

                        <!-- Menu Mode (if needed) -->
                        <div *ngIf="showMenuModeButton()" class="flex flex-col gap-2">
                            <span class="text-sm text-muted-color font-semibold">Menu Mode</span>
                            <p-selectbutton [ngModel]="menuMode()" (ngModelChange)="onMenuModeChange($event)" [options]="menuModeOptions" [allowEmpty]="false" size="small" />
                        </div>

                        <!-- Save Preset -->
                        <div>
                            <p-button type="button" (click)="savePreset()" icon="pi pi-save" label="Save Settings" styleClass="w-full"></p-button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </p-drawer>
    `,
    host: {
        class: 'hidden absolute top-[3.25rem] right-0 w-72 p-4 bg-[var(--surface-ground)] border border-surface rounded-lg origin-top shadow-sm'
    }
})
export class AppConfigurator implements OnChanges, OnInit {
    router = inject(Router);
    config: PrimeNG = inject(PrimeNG);
    layoutService: LayoutService = inject(LayoutService);
    platformId = inject(PLATFORM_ID);
    primeng = inject(PrimeNG);

    showMenuModeButton = signal(!this.router.url.includes('auth'));

    menuModeOptions = [
        { label: 'Static', value: 'static' },
        { label: 'Overlay', value: 'overlay' },
        { label: 'Horizontal', value: 'horizontal' }
    ];

    colorSchemeOptions = [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' }
    ];

    @ViewChild('drawerRef') drawerRef!: Drawer;
    @Input() openSetting: boolean = false;
    @Output() onSettingChange = new EventEmitter<boolean>();

    constructor(private configService: ConfigService) {}

    ngOnChanges() {}

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.loadStaticConfig();
        }
    }

    private loadStaticConfig() {
        const config = {
            preset: 'Aura',
            primary: 'custom-black',
            surface: 'gray',
            darkTheme: false,
            menuMode: 'static' as const
        };

        // 1. Load configuration
        this.layoutService.loadInitialConfig(config);

        // 2. Apply preset and colors
        this.applyCustomTheme();
    }

    private applyCustomTheme() {
        const customPreset = {
            semantic: {
                primary: CUSTOM_PRIMARY_PALETTE,
                colorScheme: {
                    light: {
                        primary: {
                            color: '#333333',
                            contrastColor: '#ffffff',
                            hoverColor: '#1a1a1a',
                            activeColor: '#0d0d0d'
                        },
                        highlight: {
                            background: '#f5f5f5',
                            focusBackground: '#e0e0e0',
                            color: '#333333',
                            focusColor: '#1a1a1a'
                        }
                    },
                    dark: {
                        primary: {
                            color: '#e0e0e0',
                            contrastColor: '#0d0d0d',
                            hoverColor: '#ffffff',
                            activeColor: '#ffffff'
                        },
                        highlight: {
                            background: 'color-mix(in srgb, #e0e0e0, transparent 84%)',
                            focusBackground: 'color-mix(in srgb, #e0e0e0, transparent 76%)',
                            color: 'rgba(255,255,255,.87)',
                            focusColor: 'rgba(255,255,255,.87)'
                        }
                    }
                }
            }
        };

        // Apply theme
        $t().preset(Aura).preset(customPreset).surfacePalette(FIXED_SURFACE_PALETTE).use({ useDefaultOptions: true });
    }

    closeCallback(): void {
        this.openSetting = false;
        this.onSettingChange.emit(false);
    }

    menuMode = computed(() => this.layoutService.layoutConfig().menuMode);
    colorScheme = computed(() => (this.layoutService.layoutConfig().darkTheme ? 'dark' : 'light'));

    onColorSchemeChange(event: string) {
        const isDark = event === 'dark';
        this.layoutService.layoutConfig.update((state: any) => ({
            ...state,
            darkTheme: isDark
        }));

        // Reapply theme with new color scheme
        this.applyCustomTheme();
    }

    onMenuModeChange(event: string) {
        this.layoutService.layoutConfig.update((prev: any) => ({
            ...prev,
            menuMode: event
        }));
    }

    savePreset() {
        const payload = {
            preset: 'Aura',
            primary: 'custom-black',
            surface: 'slate',
            darkTheme: this.layoutService.layoutConfig().darkTheme as boolean,
            menuMode: this.layoutService.layoutConfig().menuMode as 'static' | 'overlay' | 'horizontal'
        };

        this.configService.saveUserPreferences(payload).subscribe({
            next: (res) => console.log('Settings saved successfully'),
            error: (err) => console.error('Error saving settings:', err),
            complete: () => {}
        });
    }
}

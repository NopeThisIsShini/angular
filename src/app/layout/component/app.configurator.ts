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
import { ColorType } from '../models';



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

    constructor(private configService: ConfigService) { }

    ngOnChanges() { }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.loadStaticConfig();
        }
    }
    primaryPalette: ColorType = {
        name: 'custom',
        palette: {
            50: "#D0FCFF",
            100: "#7CF8FF",
            200: "#17E2EA",
            300: "#13C9D1",
            400: "#0FAFB5",
            500: "#0B959A",
            600: "#077C81",
            700: "#056468",
            800: "#034F52",
            900: "#01393B",
            950: "#012E30"
        }
    };

    surfacePalette: ColorType = {
        name: 'zinc',
        palette: {
            0: '#ffffff',
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#71717a',
            600: '#52525b',
            700: '#3f3f46',
            800: '#27272a',
            900: '#18181b',
            950: '#09090b'
        }
    };

    private loadStaticConfig() {
        const config = {
            preset: 'Aura',
            primary: 'custom',
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
                primary: this.primaryPalette.palette,
                colorScheme: {
                    light: {
                        primary: {
                            color: '{primary.600}',
                            contrastColor: '#ffffff',
                            hoverColor: '{primary.700}',
                            activeColor: '{primary.800}'
                        },
                        highlight: {
                            background: '{primary.600}',
                            focusBackground: '{primary.700}',
                            color: '#ffffff',
                            focusColor: '#ffffff'
                        }
                    },
                    dark: {
                        primary: {
                            color: '{primary.500}',
                            contrastColor: '{surface.900}',
                            hoverColor: '{primary.400}',
                            activeColor: '{primary.300}'
                        },
                        highlight: {
                            background: '{primary.500}',
                            focusBackground: '{primary.400}',
                            color: '{surface.900}',
                            focusColor: '{surface.900}'
                        }
                    }
                }
            }
        };

        // Apply theme
        $t().preset(Aura).preset(customPreset).surfacePalette(this.surfacePalette.palette).use({ useDefaultOptions: true });
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
            primary: 'custom',
            surface: 'slate',
            darkTheme: this.layoutService.layoutConfig().darkTheme as boolean,
            menuMode: this.layoutService.layoutConfig().menuMode as 'static' | 'overlay' | 'horizontal'
        };

        this.configService.saveUserPreferences(payload).subscribe({
            next: (res) => console.log('Settings saved successfully'),
            error: (err) => console.error('Error saving settings:', err),
            complete: () => { }
        });
    }
}

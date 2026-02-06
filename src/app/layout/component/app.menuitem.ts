import { Component, HostBinding, input, viewChild, computed, effect, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../service/layout.service';
import { TieredMenu, TieredMenuModule } from 'primeng/tieredmenu';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-menuitem]',
    standalone: true,
    imports: [CommonModule, RouterModule, RippleModule, TieredMenuModule],
    template: `
        <ng-container>
            <div *ngIf="root() && item().visible !== false" class="layout-menuitem-root-text">{{ item().label }}</div>
            <a *ngIf="(!item().routerLink || item().items) && item().visible !== false" [attr.href]="item().url" (click)="itemClick($event)" [ngClass]="item().styleClass" [attr.target]="item().target" tabindex="0" pRipple>
                <i [ngClass]="item().icon" class="layout-menuitem-icon"></i>
                <span class="layout-menuitem-text">{{ item().label }}</span>
                <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item().items"></i>
            </a>
            <a
                *ngIf="item().routerLink && !item().items && item().visible !== false"
                (click)="itemClick($event)"
                [ngClass]="item().styleClass"
                [routerLink]="item().routerLink"
                routerLinkActive="active-route"
                [routerLinkActiveOptions]="item().routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
                [fragment]="item().fragment"
                [queryParamsHandling]="item().queryParamsHandling"
                [preserveFragment]="item().preserveFragment"
                [skipLocationChange]="item().skipLocationChange"
                [replaceUrl]="item().replaceUrl"
                [state]="item().state"
                [queryParams]="item().queryParams"
                [attr.target]="item().target"
                tabindex="0"
                pRipple
            >
                <i [ngClass]="item().icon" class="layout-menuitem-icon"></i>
                <span class="layout-menuitem-text">{{ item().label }}</span>
                <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item().items"></i>
            </a>

            <ul *ngIf="item().items && item().visible !== false" [@children]="submenuAnimation()">
                <ng-template ngFor let-child let-i="index" [ngForOf]="item().items">
                    <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child['badgeClass']"></li>
                </ng-template>
            </ul>

            <p-tieredMenu #menu [model]="item().items" [popup]="true" appendTo="body" styleClass="layout-slim-menu-popup"></p-tieredMenu>
        </ng-container>
    `,
    animations: [
        trigger('children', [
            state('collapsed', style({ height: '0' })),
            state('expanded', style({ height: '*' })),
            transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ]
})
export class AppMenuitem implements OnInit {
    item = input.required<MenuItem>();
    index = input.required<number>();
    root = input<boolean>(false);
    parentKey = input<string>('');

    @HostBinding('class.layout-root-menuitem') 
    get isRoot() { return this.root(); }

    menu = viewChild<TieredMenu>('menu');

    private layoutService = inject(LayoutService);
    private router = inject(Router);
    key: string = '';
    
    // Reactive Active State
    active = computed(() => {
        const activeKey = this.layoutService.activeMenuKey();
        return activeKey === this.key || activeKey?.startsWith(this.key + '-');
    });

    // Submenu Animation State
    submenuAnimation = computed(() => {
        return this.root() ? 'expanded' : this.active() ? 'expanded' : 'collapsed';
    });

    @HostBinding('class.active-menuitem')
    get activeClass() {
        return this.active() && !this.root();
    }

    // Router events as a signal
    private navEnd = toSignal(this.router.events.pipe(filter((event) => event instanceof NavigationEnd)));

    constructor() {
        // React to route changes
        effect(() => {
            if (this.navEnd() && this.item()?.routerLink) {
                this.updateActiveStateFromRoute();
            }
        });
    }

    ngOnInit() {
        this.key = this.parentKey() ? this.parentKey() + '-' + this.index() : String(this.index());

        if (this.item().routerLink) {
            this.updateActiveStateFromRoute();
        }
    }

    updateActiveStateFromRoute() {
        const isActive = this.router.isActive(this.item().routerLink![0], { 
            paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' 
        });

        if (isActive) {
            this.layoutService.onMenuStateChange({ key: this.key, routeEvent: true });
        }
    }

    itemClick(event: Event) {
        const item = this.item();
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if (item.command) {
            item.command({ originalEvent: event, item: item });
        }

        if (item.items) {
            if (this.layoutService.isSlim() && !this.root() && !this.layoutService.isMobile()) {
                this.menu()?.toggle(event);
            }
        }

        this.layoutService.onMenuStateChange({ key: this.key });
    }
}

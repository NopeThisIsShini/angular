import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { RippleModule } from 'primeng/ripple';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-popup-menuitem]',
    standalone: true,
    imports: [CommonModule, RouterModule, TieredMenuModule, RippleModule],
    template: `
        @if (item().visible !== false) {
            <a *ngIf="item().routerLink && !item().items" 
               [routerLink]="item().routerLink" 
               class="layout-menuitem-action" 
               routerLinkActive="active-route" 
               [routerLinkActiveOptions]="item().routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
               [attr.aria-label]="item().label"
               pRipple>
                <i [ngClass]="item().icon"></i>
                <span *ngIf="!iconOnly()">{{ item().label }}</span>
            </a>
            <ng-container *ngIf="item().items">
                <div class="layout-menuitem-action clickable" (click)="menuRef.toggle($event)" [attr.aria-label]="item().label" pRipple>
                    <i [ngClass]="item().icon"></i>
                    <span *ngIf="!iconOnly()">{{ item().label }}</span>
                    <i *ngIf="!iconOnly()" class="pi pi-angle-down"></i>
                </div>
                <p-tieredMenu #menuRef [model]="item().items" [popup]="true" appendTo="body" styleClass="layout-horizontal-menu-popup"></p-tieredMenu>
            </ng-container>
        }
    `
})
export class AppPopupMenuitem {
    item = input.required<MenuItem>();
    iconOnly = input<boolean>(false);
}

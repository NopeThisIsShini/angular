// if-scope.directive.ts
// Angular structural directive for OU-based conditional rendering

import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OUScopingService } from '../services/ou-scoping.service';

/**
 * Structural directive that shows/hides elements based on OU scope access
 * 
 * Usage Examples:
 * 
 * 1. Simple path check:
 *    <button *appIfScope="'/1/2/5/'">Edit</button>
 * 
 * 2. Check object's path:
 *    <button *appIfScope="user.organizationUnitPath">Delete User</button>
 * 
 * 3. With else template:
 *    <button *appIfScope="item.path; else noAccess">Edit</button>
 *    <ng-template #noAccess><span>No Access</span></ng-template>
 */
@Directive({
    selector: '[appIfScope]',
    standalone: false
})
export class IfScopeDirective implements OnInit, OnDestroy {
    private hasView = false;
    private targetPath: string = '';
    private subscription?: Subscription;

    @Input() set appIfScope(path: string) {
        this.targetPath = path;
        this.updateView();
    }

    @Input() appIfScopeElse?: TemplateRef<any>;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private scopingService: OUScopingService
    ) {}

    ngOnInit(): void {
        // Subscribe to user context changes
        this.subscription = this.scopingService.getCurrentUser$().subscribe(() => {
            this.updateView();
        });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private updateView(): void {
        const hasAccess = this.scopingService.canAccess(this.targetPath);

        if (hasAccess && !this.hasView) {
            this.viewContainer.clear();
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasAccess && this.hasView) {
            this.viewContainer.clear();
            if (this.appIfScopeElse) {
                this.viewContainer.createEmbeddedView(this.appIfScopeElse);
            }
            this.hasView = false;
        } else if (!hasAccess && !this.hasView && this.appIfScopeElse) {
            this.viewContainer.clear();
            this.viewContainer.createEmbeddedView(this.appIfScopeElse);
        }
    }
}

/**
 * Attribute directive that adds CSS classes based on OU scope access
 * 
 * Usage:
 *    <div [appScopeClass]="item.path" 
 *         scopeAccessClass="editable" 
 *         scopeNoAccessClass="readonly">
 *    </div>
 */
@Directive({
    selector: '[appScopeClass]',
    standalone: false
})
export class ScopeClassDirective implements OnInit, OnDestroy {
    private subscription?: Subscription;
    private element: HTMLElement;

    @Input() appScopeClass: string = '';
    @Input() scopeAccessClass: string = 'scope-accessible';
    @Input() scopeNoAccessClass: string = 'scope-restricted';

    constructor(
        private viewContainer: ViewContainerRef,
        private scopingService: OUScopingService
    ) {
        // Get native element through view container
        this.element = this.viewContainer.element.nativeElement;
    }

    ngOnInit(): void {
        this.subscription = this.scopingService.getCurrentUser$().subscribe(() => {
            this.updateClasses();
        });
        this.updateClasses();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private updateClasses(): void {
        const hasAccess = this.scopingService.canAccess(this.appScopeClass);
        
        if (hasAccess) {
            this.element.classList.add(this.scopeAccessClass);
            this.element.classList.remove(this.scopeNoAccessClass);
        } else {
            this.element.classList.remove(this.scopeAccessClass);
            this.element.classList.add(this.scopeNoAccessClass);
        }
    }
}

/**
 * Attribute directive that disables elements outside user's OU scope
 * 
 * Usage:
 *    <button [appScopeDisable]="item.path">Edit</button>
 */
@Directive({
    selector: '[appScopeDisable]',
    standalone: false
})
export class ScopeDisableDirective implements OnInit, OnDestroy {
    private subscription?: Subscription;
    private element: HTMLElement;

    @Input() appScopeDisable: string = '';

    constructor(
        private viewContainer: ViewContainerRef,
        private scopingService: OUScopingService
    ) {
        this.element = this.viewContainer.element.nativeElement;
    }

    ngOnInit(): void {
        this.subscription = this.scopingService.getCurrentUser$().subscribe(() => {
            this.updateDisabled();
        });
        this.updateDisabled();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private updateDisabled(): void {
        const hasAccess = this.scopingService.canAccess(this.appScopeDisable);
        
        if (hasAccess) {
            this.element.removeAttribute('disabled');
            (this.element as any).disabled = false;
        } else {
            this.element.setAttribute('disabled', 'true');
            (this.element as any).disabled = true;
        }
    }
}

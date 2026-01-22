import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
    selector: '[appHasPermission]'
})
export class HasPermissionDirective {
    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private permission: PermissionService
    ) {}

    @Input() set appHasPermission(keys: string | string[]) {
        const keyList = Array.isArray(keys) ? keys : [keys];
        if (this.permission.hasAllPermissions(keyList)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}

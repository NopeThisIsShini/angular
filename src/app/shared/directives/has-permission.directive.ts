import { Directive, input, TemplateRef, ViewContainerRef, effect, computed, inject } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
    selector: '[appHasPermission]',
    standalone: true
})
export class HasPermissionDirective {
    private templateRef = inject(TemplateRef<any>);
    private viewContainer = inject(ViewContainerRef);
    private permissionService = inject(PermissionService);

    appHasPermission = input<string | string[]>([], {
        alias: 'appHasPermission'
    });
    
    // Create a computed signal that reacts to both keys and permissions changing
    private keys = computed(() => {
        const val = this.appHasPermission();
        return Array.isArray(val) ? val : [val];
    });

    private hasPermission = computed(() => {
        const keyList = this.keys();
        if (keyList.length === 0) return true;
        // The service method now returns a signal, we must call it to 'subscribe'
        return this.permissionService.hasAllPermissions(keyList)();
    });

    constructor() {
        // Automatically sync the UI whenever the permission status changes
        effect(() => {
            this.viewContainer.clear();
            if (this.hasPermission()) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            }
        });
    }
}

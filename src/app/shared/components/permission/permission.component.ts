import { Component, EventEmitter, Input, OnInit, Output, ViewChild, computed, signal, inject, input, effect, output, untracked } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TreeComponent, TreeSelectionEvent } from '../UI/tree/tree.component';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';

import { grantedPermissions, PermissionData } from '../../models/permission.model';
import { PermissionService } from '../../services/permission.service';

@Component({
    selector: 'app-permission',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, MessageModule, TreeComponent, PanelModule, AccordionModule],
    templateUrl: './permission.component.html',
    styleUrl: './permission.component.scss'
})
export class PermissionComponent {
    private permissionService = inject(PermissionService);
    
    // Inputs (Signals)
    initialPermissions = input<string[]>([]);
    isRoleEditing = input<boolean>(false);
    
    // Outputs (Signals)
    onSave = output<{ data: string[] }>();
    
    // Internal State
    permissionTreeData = this.permissionService.permissionTree;
    selectedNodes = signal<TreeNode[]>([]);
    loading = signal<boolean>(false);
    message = signal<string>('');
    messageType = signal<'success' | 'info' | 'warn' | 'error'>('info');

    // Statistics
    totalPermissionCount = computed(() => this.permissionService.getAllAvailablePermissions().length);
    selectedPermissionCount = computed(() => this.selectedNodes().length);

    constructor() {
        // Automatically load permissions when input changes or component is initialized
        effect(() => {
            const perms = this.initialPermissions();
            const tree = this.permissionTreeData();
            
            // Only proceed if we have a tree to map permissions to
            if (tree.length > 0) {
                untracked(() => {
                    // Check if the new initial permissions are actually different from current selection
                    const currentPerms = this.permissionService.getPermissionsFromNodes(this.selectedNodes());
                    const currentKeys = Object.keys(currentPerms).sort();
                    const newKeys = [...perms].sort();

                    if (JSON.stringify(currentKeys) !== JSON.stringify(newKeys)) {
                        this.loadPermissions(perms);
                    }
                });
            }
        });
    }

    private loadPermissions(apiResponse: grantedPermissions) {
        this.loading.set(true);
        try {
            if (this.isRoleEditing()) {
                // Update the service state
                this.permissionService.loadRolePermissions(apiResponse);
                
                // Map the data to tree nodes for UI
                const tree = this.permissionTreeData();
                const nodes = this.permissionService.getSelectedRolePermissionNodes(tree);
                this.selectedNodes.set(nodes);
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
        } finally {
            this.loading.set(false);
        }
    }

    // Public method for legacy support if needed
    loadPermissionsFromApiResponse(apiResponse: grantedPermissions) {
        this.loadPermissions(apiResponse);
    }

    savePermissions() {
        try {
            const permissions = this.permissionService.getPermissionsFromNodes(this.selectedNodes());
            if (this.isRoleEditing()) {
                this.permissionService.saveRolePermissions(permissions);
                const permissionKeys: string[] = Object.keys(permissions);
                this.onSave.emit({ data: permissionKeys });
            }
        } catch (error) {
            console.error('Error saving permissions:', error);
        }
    }

    onSelectionChange(selectedNodes: TreeNode[]) {
        this.selectedNodes.set(selectedNodes);
        this.savePermissions();
    }

    onNodeSelectionChange(event: TreeSelectionEvent) {}

    hasPermission(permission: string): boolean {
        const rolePermissions = this.permissionService.getRolePermissions();
        return !!rolePermissions[permission];
    }

    getCurrentPermissions(): PermissionData {
        return this.permissionService.getRolePermissions();
    }

    getPermissionsByModule(moduleKey: string): PermissionData {
        return this.permissionService.getPermissionsByModule(moduleKey);
    }
}

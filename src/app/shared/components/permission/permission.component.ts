import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
export class PermissionComponent implements OnInit {
    @ViewChild('permissionTree') permissionTree!: TreeComponent;
    permissionTreeData: TreeNode[] = [];
    selectedNodes: TreeNode[] = [];
    loading: boolean = false;
    message: string = '';
    messageType: 'success' | 'info' | 'warn' | 'error' = 'info';

    // Statistics
    selectedPermissionCount = 0;
    totalPermissionCount = 0;
    activeModulesCount = 0;
    @Input() isRoleEditing: boolean = false;
    @Output() onSave = new EventEmitter<{ data: string[] }>();
    constructor(private permissionService: PermissionService) {}

    ngOnInit() {
        this.initializePermissions();
    }

    private initializePermissions() {
        this.permissionTreeData = this.permissionService.getPermissionTree();
        this.totalPermissionCount = this.permissionService.getAllAvailablePermissions().length;
    }

    loadPermissionsFromApiResponse(apiResponse: grantedPermissions) {
        this.loading = true;
        try {
            if (this.isRoleEditing) {
                this.permissionService.loadRolePermissions(apiResponse);
            }
            // Refresh the tree data
            this.permissionTreeData = this.permissionService.getPermissionTree();
            this.totalPermissionCount = this.permissionService.getAllAvailablePermissions().length;

            // Update selected nodes based on context
            if (this.isRoleEditing) {
                this.selectedNodes = this.permissionService.getSelectedRolePermissionNodes(this.permissionTreeData);
            }
        } catch (error) {
            console.error('Error loading permissions from API:', error);
        } finally {
            this.loading = false;
        }
    }

    savePermissions() {
        try {
            const permissions = this.permissionService.getPermissionsFromNodes(this.selectedNodes);
            if (this.isRoleEditing) {
                this.permissionService.saveRolePermissions(permissions);
                const permissionKeys: string[] = Object.keys(permissions);
                if (permissionKeys.length > 0) {
                    this.onSave.emit({ data: permissionKeys as string[] });
                }
            }
        } catch (error) {
            console.error('Error saving permissions:', error);
        } finally {
        }
    }

    onSelectionChange(selectedNodes: TreeNode[]) {
        this.selectedNodes = selectedNodes;
        this.savePermissions();
    }

    onNodeSelectionChange(event: TreeSelectionEvent) {
        // Handle individual node selection if needed
        // console.log('Node selection changed:', event);
    }

    // Utility methods for template
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

// permission.service.ts
import { Injectable } from '@angular/core';

import { TreeNode } from 'primeng/api';
import { TreeService, TreeStructureItem } from './tree.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPermission, ApiPermissionResponse, grantedPermissions, PermissionData } from '../models/permission.model';
import { api_routes } from '../../utils/routes/api.route';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private roleEditingPermissions: PermissionData = {};
    private permissionStructure: TreeStructureItem[] = [];
    private storedPermissions: PermissionData = {};

    constructor(
        private treeService: TreeService,
        private http: HttpClient
    ) {}

    private convertApiPermissionsToTreeStructure(apiResponse: ApiPermissionResponse): TreeStructureItem[] {
        const permissions = apiResponse.result.permissions;
        // Group permissions by parent
        const permissionMap = new Map<string, ApiPermission[]>();
        const rootPermissions: ApiPermission[] = [];

        permissions.forEach((perm) => {
            if (perm.parentName === null) {
                rootPermissions.push(perm);
            } else {
                if (!permissionMap.has(perm.parentName)) {
                    permissionMap.set(perm.parentName, []);
                }
                permissionMap.get(perm.parentName)!.push(perm);
            }
        });

        const buildTreeStructure = (perms: ApiPermission[]): TreeStructureItem[] => {
            return perms.map((perm) => {
                const children = permissionMap.get(perm.name);
                const item: TreeStructureItem = {
                    key: perm.name,
                    label: perm.displayName.replace(/[\[\]]/g, ''), // Remove brackets
                    data: {
                        description: perm.description,
                        isGrantedByDefault: perm.isGrantedByDefault
                    }
                };

                if (children && children.length > 0) {
                    item.children = buildTreeStructure(children);
                }

                return item;
            });
        };

        return buildTreeStructure(rootPermissions);
    }
    getUserPermissions(id: number): Observable<ApiPermissionResponse> {
        const params = new HttpParams().set('id', id.toString());
        return this.http.get<ApiPermissionResponse>(`${api_routes.getUserPermissions}`, { params });
    }
    loadPermissionsFromApi(apiResponse: ApiPermissionResponse): void {
        // Convert API structure to tree structure
        this.permissionStructure = this.convertApiPermissionsToTreeStructure(apiResponse);

        // Set granted permissions
        const grantedPermissions: PermissionData = {};
        apiResponse.result.grantedPermissionNames.forEach((permName) => {
            grantedPermissions[permName] = true;
        });

        this.storedPermissions = grantedPermissions;
    }

    loadRolePermissions(grantAllPermissions: grantedPermissions): void {
        // Convert API structure to tree structure (reuse existing method)
        // Set granted permissions for role editing
        const grantedPermissions: PermissionData = {};
        if (grantAllPermissions) {
            grantAllPermissions.forEach((permName: string) => {
                grantedPermissions[permName] = true;
            });
        }

        this.roleEditingPermissions = grantedPermissions;
    }

    /**
     * Get role editing permissions (separate from user permissions)
     */
    getRolePermissions(): PermissionData {
        return { ...this.roleEditingPermissions };
    }

    /**
     * Save role editing permissions (separate from user permissions)
     */
    saveRolePermissions(permissions: PermissionData): PermissionData {
        this.roleEditingPermissions = { ...permissions };
        return { ...this.roleEditingPermissions };
    }

    /**
     * Get selected nodes for role editing
     */
    getSelectedRolePermissionNodes(treeNodes: TreeNode[]): TreeNode[] {
        return this.treeService.getSelectedNodes(this.roleEditingPermissions, treeNodes);
    }

    /**
     * Clear role editing permissions
     */
    clearRolePermissions(): void {
        this.roleEditingPermissions = {};
    }

    /**
     * Get permission tree structure
     */
    getPermissionTree(): TreeNode[] {
        return this.treeService.buildTreeNodes(this.permissionStructure);
    }

    /**
     * Get currently stored permissions
     */
    getPermissions(): PermissionData {
        return { ...this.storedPermissions };
    }

    /**
     * Save permissions
     */
    savePermissions(permissions: PermissionData): PermissionData {
        this.storedPermissions = { ...permissions };
        return { ...this.storedPermissions };
    }

    /**
     * Get selected nodes based on current permissions
     */
    getSelectedPermissionNodes(treeNodes: TreeNode[]): TreeNode[] {
        return this.treeService.getSelectedNodes(this.storedPermissions, treeNodes);
    }

    /**
     * Convert selected nodes back to permission data
     */
    getPermissionsFromNodes(selectedNodes: TreeNode[]): PermissionData {
        return this.treeService.getDataMapFromNodes(selectedNodes) as PermissionData;
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission: string): boolean {
        return !!this.storedPermissions[permission];
    }

    /**
     * Check if user has any permission from a list
     */
    hasAnyPermission(permissions: string[]): boolean {
        return permissions.some((permission) => this.hasPermission(permission));
    }

    /**
     * Check if user has all permissions from a list
     */
    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every((permission) => this.hasPermission(permission));
    }

    /**
     * Get permissions by module (e.g., 'user', 'lead', etc.)
     */
    getPermissionsByModule(moduleKey: string): PermissionData {
        const modulePermissions: PermissionData = {};
        Object.keys(this.storedPermissions).forEach((key) => {
            if (key.startsWith(moduleKey + '.') && this.storedPermissions[key]) {
                modulePermissions[key] = true;
            }
        });
        return modulePermissions;
    }

    /**
     * Clear all permissions
     */
    clearAllPermissions(): void {
        this.storedPermissions = {};
    }

    /**
     * Grant all available permissions
     */
    grantAllPermissions(): PermissionData {
        const allPermissions: PermissionData = {};
        const treeNodes = this.getPermissionTree();
        const leafNodes = this.treeService.getAllLeafNodes(treeNodes);

        leafNodes.forEach((node) => {
            if (node.key) {
                allPermissions[node.key] = true;
            }
        });

        this.storedPermissions = allPermissions;
        return { ...this.storedPermissions };
    }

    /**
     * Update permission structure (useful for dynamic permissions)
     */
    updatePermissionStructure(newStructure: TreeStructureItem[]): void {
        const validation = this.treeService.validateTreeStructure(newStructure);
        if (!validation.valid) {
            throw new Error(`Invalid permission structure: ${validation.errors.join(', ')}`);
        }
        this.permissionStructure = newStructure;
    }

    /**
     * Get all available permission keys
     */
    getAllAvailablePermissions(): string[] {
        const treeNodes = this.getPermissionTree();
        const leafNodes = this.treeService.getAllLeafNodes(treeNodes);
        return leafNodes.map((node) => node.key).filter((key) => key) as string[];
    }
}

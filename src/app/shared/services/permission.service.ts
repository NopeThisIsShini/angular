import { Injectable, computed, inject, Signal } from '@angular/core';

import { TreeNode } from 'primeng/api';
import { TreeService, TreeStructureItem } from './tree.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPermission, ApiPermissionResponse, grantedPermissions, PermissionData } from '../models/permission.model';
import { api_routes } from '../../utils/routes/api.route';
import { SignalStore } from '@/app/store/signal-store';
import { AppStore } from '@/app/store/app.store';

interface PermissionState {
    storedPermissions: PermissionData;
    permissionStructure: TreeStructureItem[];
    roleEditingPermissions: PermissionData;
}

@Injectable({
    providedIn: 'root'
})
export class PermissionService extends SignalStore<PermissionState> {
    private treeService = inject(TreeService);
    private http = inject(HttpClient);
    private appStore = inject(AppStore);

    // Reactive Selectors
    readonly userPermissions = this.appStore.permissions; // Source of truth is Global State
    readonly permissionTree = computed(() => this.treeService.buildTreeNodes(this.$.permissionStructure()));

    constructor() {
        super({
            storedPermissions: {},
            permissionStructure: [],
            roleEditingPermissions: {}
        });
    }

    private convertApiPermissionsToTreeStructure(apiResponse: ApiPermissionResponse): TreeStructureItem[] {
        const permissions = apiResponse.result?.permissions || [];
        if (permissions.length === 0) return [];
        
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
        return this.http.get<ApiPermissionResponse>(`${api_routes.getUserPermissions}`);
    }

    loadPermissionsFromApi(apiResponse: ApiPermissionResponse): void {
        const structure = this.convertApiPermissionsToTreeStructure(apiResponse);
        const grantedNames = apiResponse.result.granted_permission_names || [];

        // 1. Update Global App State (The source of truth for reactivity)
        this.appStore.setPermissions(grantedNames);

        // 2. Update local state for legacy/tree support
        const grantedPermissions: PermissionData = {};
        grantedNames.forEach((permName) => {
            grantedPermissions[permName] = true;
        });

        this.patchState({
            permissionStructure: structure,
            storedPermissions: grantedPermissions
        });
    }

    /**
     * Check if user has specific permission (Reactive)
     */
    hasPermission(permission: string): Signal<boolean> {
        return computed(() => {
            const perms = this.userPermissions();
            const lowerPerm = permission.toLowerCase();
            return perms.some(p => p.toLowerCase() === lowerPerm);
        });
    }

    /**
     * Check if user has any permission from a list (Reactive)
     */
    hasAnyPermission(permissions: string[]): Signal<boolean> {
        return computed(() => {
            const currentPermissions = this.userPermissions();
            const lowerPermissions = currentPermissions.map(p => p.toLowerCase());
            return permissions.some(p => lowerPermissions.includes(p.toLowerCase()));
        });
    }

    /**
     * Check if user has all permissions from a list (Reactive)
     */
    hasAllPermissions(permissions: string[]): Signal<boolean> {
        return computed(() => {
            const currentPermissions = this.userPermissions();
            const lowerPermissions = currentPermissions.map(p => p.toLowerCase());
            return permissions.every(p => lowerPermissions.includes(p.toLowerCase()));
        });
    }

    /**
     * Legacy non-signal check (for non-reactive logic)
     */
    checkPermissionSync(permission: string): boolean {
        const perms = this.userPermissions();
        const lowerPerm = permission.toLowerCase();
        return perms.some(p => p.toLowerCase() === lowerPerm);
    }

    /**
     * Get permissions by module (e.g., 'user', 'lead', etc.)
     */
    getPermissionsByModule(moduleKey: string): PermissionData {
        const modulePermissions: PermissionData = {};
        const storedPermissions = this.state().storedPermissions;
        
        Object.keys(storedPermissions).forEach((key) => {
            if (key.startsWith(moduleKey + '.') && storedPermissions[key]) {
                modulePermissions[key] = true;
            }
        });
        return modulePermissions;
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

        this.patchState({ storedPermissions: allPermissions });
        this.appStore.setPermissions(Object.keys(allPermissions));
        return { ...allPermissions };
    }

    /**
     * Update permission structure (useful for dynamic permissions)
     */
    updatePermissionStructure(newStructure: TreeStructureItem[]): void {
        const validation = this.treeService.validateTreeStructure(newStructure);
        if (!validation.valid) {
            throw new Error(`Invalid permission structure: ${validation.errors.join(', ')}`);
        }
        this.patchState({ permissionStructure: newStructure });
    }

    /**
     * Get all available permission keys
     */
    getAllAvailablePermissions(): string[] {
        const treeNodes = this.getPermissionTree();
        const leafNodes = this.treeService.getAllLeafNodes(treeNodes);
        return leafNodes.map((node) => node.key).filter((key) => key) as string[];
    }
    loadRolePermissions(grantAllPermissions: grantedPermissions): void {
        const grantedPermissions: PermissionData = {};
        if (grantAllPermissions) {
            grantAllPermissions.forEach((permName: string) => {
                grantedPermissions[permName] = true;
            });
        }
        this.patchState({ roleEditingPermissions: grantedPermissions });
    }

    getRolePermissions(): PermissionData {
        return { ...this.state().roleEditingPermissions };
    }

    saveRolePermissions(permissions: PermissionData): PermissionData {
        this.patchState({ roleEditingPermissions: { ...permissions } });
        return this.getRolePermissions();
    }

    getSelectedRolePermissionNodes(treeNodes: TreeNode[]): TreeNode[] {
        return this.treeService.getSelectedNodes(this.state().roleEditingPermissions, treeNodes);
    }

    clearRolePermissions(): void {
        this.patchState({ roleEditingPermissions: {} });
    }

    getPermissionTree(): TreeNode[] {
        return this.permissionTree();
    }

    getPermissions(): PermissionData {
        return { ...this.state().storedPermissions };
    }

    savePermissions(permissions: PermissionData): PermissionData {
        this.patchState({ storedPermissions: { ...permissions } });
        return this.getPermissions();
    }

    getSelectedPermissionNodes(treeNodes: TreeNode[]): TreeNode[] {
        return this.treeService.getSelectedNodes(this.state().storedPermissions, treeNodes);
    }

    getPermissionsFromNodes(selectedNodes: TreeNode[]): PermissionData {
        return this.treeService.getDataMapFromNodes(selectedNodes) as PermissionData;
    }

    clearAllPermissions(): void {
        this.patchState({ storedPermissions: {} });
        this.appStore.setPermissions([]);
    }
}

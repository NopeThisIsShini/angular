import { CommonModel } from './api/common.model';

export interface PermissionData {
    [key: string]: boolean;
}
export interface ApiPermission {
    id: number;
    name: string;
    slug: string;
    displayName: string;
    description: string | null;
    resource: string;
    action: string;
    module: string;
    parentName: string | null;
    order: number;
    isGrantedByDefault: boolean;
    isSystem: boolean;
    createdAt: string;
}

export interface ApiPermissionResponse extends CommonModel {
    result: {
        permissions: ApiPermission[];
        granted_permission_names: string[];
    };
}

export type grantedPermissions = string[];

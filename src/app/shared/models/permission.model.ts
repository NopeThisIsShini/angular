import { CommonModel } from './api/common.model';

export interface PermissionData {
    [key: string]: boolean;
}
export interface ApiPermission {
    parentName: string | null;
    name: string;
    displayName: string;
    description: string | null;
    isGrantedByDefault: boolean;
}

export interface ApiPermissionResponse extends CommonModel {
    result: {
        permissions: ApiPermission[];
        grantedPermissionNames: string[];
    };
}

export type grantedPermissions = string[];

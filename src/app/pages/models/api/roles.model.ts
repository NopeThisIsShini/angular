import { CommonModel } from '@app/shared/models';

export interface RolesModel {
    id: number;
    name: string;
    displayName: string;
    normalizedName: string;
    description: string;
    grantedPermissions: string[];
}
export interface PermissionModule {
    id: number;
    name: string;
    displayName: string;
    description: string;
    parentName: string;
    isGrantedByDefault: boolean;
}
export interface roleResponse extends CommonModel {
    result: RolesModel;
}
export interface GetAllPermissionsOutputModel extends CommonModel {
    result: {
        items: PermissionModule[];
    };
}
export interface GetAllRolesOutputModel extends CommonModel {
    result: {
        totalCount: number;
        items: RolesModel[];
    };
}
export interface GetallRolesInputParamsModel extends CommonModel {
    Keyword: string;
    SkipCount: number;
    MaxResultCount: number;
}

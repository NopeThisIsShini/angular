import { CommonModel, inputParamModel } from '@app/shared/models';

export interface UsersModel {
    userName: string;
    name: string;
    surname: string;
    fullName: string;
    emailAddress: string;
    isActive: boolean;
    roleNames: string[];
    lastLoginTime?: string;
    password: string;
    id: number;
    phoneNumber: string;
    organizationUnitId: number | null;
    organizationUnitPath?: string;      // OU Path for scoping (e.g., '/1/2/')
    organizationUnitName?: string;      // Display name of the OU
}

export interface getUserResponse extends CommonModel {
    result: {
        items: UsersModel[];
        totalCount: number;
    };
}

export interface userInputParamModel extends inputParamModel {
    userName?: string;
}

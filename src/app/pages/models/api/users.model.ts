import { CommonModel, inputParamModel } from '@/app/shared/models';

export interface UsersModel {
    // userName: string;
    firstName: string;
    lastName: string;
    // fullName: string;
    email: string;
    status: boolean;
    roleIds: number[];
    // lastLoginTime?: string;
    // password: string;
    id: number;
    phone: string;
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

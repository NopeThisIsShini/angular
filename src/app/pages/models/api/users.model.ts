import { CommonModel, inputParamModel } from '@/app/shared/models';

export interface UsersModel {
    firstName: string;
    lastName: string;
    email: string;
    status: boolean;
    roleIds: number[];
    id?: number;
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

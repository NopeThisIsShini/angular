import { CommonModel } from '@app/shared/models';

export interface loginRequest {
    userNameOrEmailAddress: string;
    password: string;
    rememberClient: boolean;
}

export interface loginResponse extends CommonModel {
    result: {
        accessToken: string;
        encryptedAccessToken: string;
        expireInSeconds: number;
        userId: number;
    };
}

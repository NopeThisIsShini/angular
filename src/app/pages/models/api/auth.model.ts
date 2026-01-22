import { CommonModel } from '@app/shared/models';

export interface signupRequest {
    firstName: string;
    surname: string;
    userName: string;
    emailAddress: string;
    password: string;
    captchaResponse?: string;
    tenancyName: string;
    name: string;
    isActive: boolean;
}

export interface signupResponse extends CommonModel {
    result: {
        canLogin: boolean;
    };
}

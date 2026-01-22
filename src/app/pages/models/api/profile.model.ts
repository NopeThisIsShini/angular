import { CommonModel } from '@app/shared/models';

export interface ProfileData {
    name: string;
    surName: string;
    emailAddress: string;
    userName: string;
    profileName: string;
    profilePicture: string; // base64 image or URL
}

export interface UserProfileResult extends CommonModel {
    result: ProfileData;
}

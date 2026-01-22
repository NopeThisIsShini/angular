export interface CommonModel {
    targetUrl: string;
    success: boolean;
    error: any;
    unAuthorizedRequest: boolean;
    __abp: boolean;
}

export interface UserPreferences extends CommonModel {
    result: userPreferenceConfig;
}
export interface userPreferenceConfig {
    preset: string;
    primary: string;
    surface: string;
    darkTheme: boolean;
    menuMode: string;
    userId?: string;
}

// current info
export interface ApplicationInfo {
    version: string;
    releaseDate: string;
    features: Record<string, any>;
}

export interface UserInfo {
    name: string;
    surname: string;
    userName: string;
    emailAddress: string;
    id: number;
}

export interface Result {
    application: ApplicationInfo;
    user: UserInfo;
    tenant: any | null;
}

export interface AppInfoResponse extends CommonModel {
    result: Result;
}

//
export interface GetAllItemsInputParamsModel {
    Keyword?: string;
    MaxResultCount?: number;
    SkipCount?: number;
}

// image model
export interface ImageUploadResponse extends CommonModel {
    result: string;
}

import { CommonModel } from '@app/shared/models';

export interface smtpSettingsPayload {
    name: string;
}

export interface EmailSettings {
    defaultFromAddress: string;
    defaultFromDisplayName: string;
    smtpHost: string;
    smtpPort: number;
    smtpUserName: string;
    smtpPassword: string;
    smtpEnableSsl: boolean;
    smtpUseDefaultCredentials: boolean;
    smtpDomain: string;
}

export interface EmailSettingsResult extends CommonModel {
    result: EmailSettings;
}

export interface EmailConfig {
    defaultFromAddress: string;
    defaultFromDisplayName: string;
    smtpHost: string;
    smtpPort: number;
    smtpUserName: string;
    smtpPassword: string;
    smtpEnableSsl: boolean;
    smtpUseDefaultCredentials: boolean;
    smtpDomain: string;
}

export interface EmailSettingsResponse {
    email: EmailConfig;
}

export interface EmailSettings extends CommonModel {
    result: EmailSettingsResponse;
}

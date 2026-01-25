import { CommonModel, inputParamModel } from '@app/shared/models';

export interface TenantModel {
    id: number;
    tenancyName: string;
    name: string;
    adminEmailAddress: string;
    connectionString: string | null;
    isActive: boolean;
    editionId: number | null;
    editionDisplayName: string | null;
    subscriptionEndDateUtc: string | null;
    isInTrialPeriod: boolean;
    creationTime: string;
}

export interface GetAllTenantsResponse extends CommonModel {
    result: {
        items: TenantModel[];
        totalCount: number;
    };
}

export interface GetTenantByIdResponse extends CommonModel {
    result: TenantModel;
}

export interface TenantInputParamModel extends inputParamModel {
    isActive?: boolean;
    editionId?: number;
}

export interface CreateTenantInput {
    tenancyName: string;
    name: string;
    adminEmailAddress: string;
    adminPassword?: string;
    connectionString?: string | null;
    isActive?: boolean;
    editionId?: number | null;
    subscriptionEndDateUtc?: string | null;
    isInTrialPeriod?: boolean;
}

export interface UpdateTenantInput {
    id: number;
    tenancyName: string;
    name: string;
    adminEmailAddress: string;
    connectionString?: string | null;
    isActive?: boolean;
    editionId?: number | null;
    subscriptionEndDateUtc?: string | null;
    isInTrialPeriod?: boolean;
}

import { CommonModel, inputParamModel } from '@app/shared/models';

export interface TenantModel {
    id: number;
    name: string;
    slug: string;
    organizationId: number;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string | null;
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
    status?: string;
}

export interface CreateTenantInput {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    password?: string;
    tenantSlug: string;
    tenantName: string;
}

export interface UpdateTenantInput extends Partial<CreateTenantInput> {
    id: number;
}

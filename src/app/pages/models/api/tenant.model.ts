import { CommonModel } from '@app/shared/models';

// Tenant (Customer) Model
export interface Tenant {
    id: number;
    tenancyName: string; // Unique slug: "tata-group"
    name: string; // Display: "Tata Group"
    editionId: number; // Subscription plan
    editionName?: string;
    isActive: boolean;
    subscriptionEndDate?: string;
    maxUsers?: number;
    maxOrganizationUnits?: number;
    userCount?: number;
    createdAt: string;
}

// Create Tenant Input
export interface CreateTenantInput {
    tenancyName: string;
    name: string;
    editionId: number;
    adminEmailAddress: string;
    adminPassword: string;
    subscriptionEndDate?: string;
}

// Update Tenant Input
export interface UpdateTenantInput {
    id: number;
    name: string;
    editionId?: number;
    isActive?: boolean;
    subscriptionEndDate?: string;
}

// Get All Tenants Response
export interface GetAllTenantsResponse extends CommonModel {
    result: {
        totalCount: number;
        items: Tenant[];
    };
}

// Single Tenant Response
export interface TenantResponse extends CommonModel {
    result: Tenant;
}

// Impersonation Response
export interface ImpersonationResponse extends CommonModel {
    result: {
        impersonationToken: string;
        tenantId: number;
    };
}

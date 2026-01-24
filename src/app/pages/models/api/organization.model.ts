import { CommonModel } from '@app/shared/models';

// Organization Unit Model
export interface OrganizationUnit {
    id: number;
    tenantId: number;
    parentId: number | null; // null = root level
    code: string; // Unique hierarchical code: "001.002.001"
    displayName: string; // "Titan Watches Division"
    level: number; // 0 = root, 1, 2, 3... depth
    path: string; // "/1/5/12/" - ancestry path for queries
    memberCount?: number; // Users in this OU
    childCount?: number; // Direct children count
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Organization Unit Tree (with nested children)
export interface OrganizationUnitTree extends OrganizationUnit {
    children: OrganizationUnitTree[];
}

// Create Organization Unit Input
export interface CreateOrganizationUnitInput {
    parentId?: number | null;
    displayName: string;
}

// Update Organization Unit Input
export interface UpdateOrganizationUnitInput {
    id: number;
    displayName: string;
}

// Move Organization Unit Input
export interface MoveOrganizationUnitInput {
    id: number;
    newParentId: number | null;
}

// Assign User to Organization Unit Input
export interface AssignUserToOUInput {
    organizationUnitId: number;
    userId: number;
}

// Get All Organization Units Response (Flat)
export interface GetAllOrganizationUnitsResponse extends CommonModel {
    result: {
        totalCount: number;
        items: OrganizationUnit[];
    };
}

// Get Organization Unit Tree Response
export interface GetOrganizationUnitTreeResponse extends CommonModel {
    result: {
        items: OrganizationUnitTree[];
    };
}

// Single Organization Unit Response
export interface OrganizationUnitResponse extends CommonModel {
    result: OrganizationUnit;
}

// Get Organization Unit Users Response
export interface GetOrganizationUnitUsersResponse extends CommonModel {
    result: {
        totalCount: number;
        items: OrganizationUnitUser[];
    };
}

// Organization Unit User (simplified user for OU context)
export interface OrganizationUnitUser {
    id: number;
    userId: number;
    organizationUnitId: number;
    userName: string;
    name: string;
    surname: string;
    emailAddress: string;
    addedTime: string;
}

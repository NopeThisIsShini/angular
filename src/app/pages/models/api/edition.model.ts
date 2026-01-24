import { CommonModel } from '@app/shared/models';

// Edition (Subscription Plan) Model
export interface Edition {
    id: number;
    name: string; // "Enterprise", "Professional", "Starter"
    displayName: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    trialDays?: number;
    maxUsers?: number; // null = unlimited
    maxOrganizationUnits?: number;
    features: string[]; // ["SSO", "API Access", "Priority Support"]
    isActive: boolean;
}

// Create Edition Input
export interface CreateEditionInput {
    name: string;
    displayName: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    trialDays?: number;
    maxUsers?: number;
    maxOrganizationUnits?: number;
    features: string[];
}

// Update Edition Input
export interface UpdateEditionInput {
    id: number;
    name?: string;
    displayName?: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    maxUsers?: number;
    maxOrganizationUnits?: number;
    features?: string[];
    isActive?: boolean;
}

// Get All Editions Response
export interface GetAllEditionsResponse extends CommonModel {
    result: {
        items: Edition[];
    };
}

// Single Edition Response
export interface EditionResponse extends CommonModel {
    result: Edition;
}

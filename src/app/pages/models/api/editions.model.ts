import { CommonModel, inputParamModel } from '@/app/shared/models';

export interface EditionModel {
    id: number;
    name: string;
    displayName: string;
    monthlyPrice: number | null;
    annualPrice: number | null;
    trialDayCount: number | null;
    waitingDayAfterExpire: number | null;
    expiringEditionId: number | null;
    isActive: boolean;
    isFree: boolean;
    creationTime: string;
}

export interface EditionFeatureModel {
    id: number;
    name: string;
    displayName: string;
    defaultValue: string;
    editionId: number;
}

export interface EditionWithFeaturesModel extends EditionModel {
    features: EditionFeatureModel[];
}

export interface GetAllEditionsResponse extends CommonModel {
    result: {
        items: EditionModel[];
        totalCount: number;
    };
}

export interface GetEditionByIdResponse extends CommonModel {
    result: EditionWithFeaturesModel;
}

export interface EditionInputParamModel extends inputParamModel {
    isActive?: boolean;
}

export interface CreateOrUpdateEditionInput {
    id?: number;
    name: string;
    displayName: string;
    monthlyPrice?: number | null;
    annualPrice?: number | null;
    trialDayCount?: number | null;
    waitingDayAfterExpire?: number | null;
    expiringEditionId?: number | null;
    isFree?: boolean;
}

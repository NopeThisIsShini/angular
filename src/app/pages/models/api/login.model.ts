import { CommonModel } from '@app/shared/models';

export interface loginRequest {
    // userNameOrEmailAddress: string;
    // rememberClient: boolean;
    email: string;
    password: string;
}

export interface loginResponse extends CommonModel {
    result: {
        accessToken: string;
        refreshToken: string;
        // encryptedAccessToken: string;
        // expireInSeconds: number;
        // userId: number;
    };
}


export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  tenantId: number;
  departmentId: number | null;
  avatarUrl: string | null;
  isVerified: boolean;
  lastLoginAt: string;  
  createdAt: string;    
  updatedAt: string; 
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
export interface TenantBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
}

export interface TenantSettings {
  maxUsers: number;
  features: string[];
  branding: TenantBranding;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  settings: TenantSettings;
  createdAt: Date;
  expiresAt?: Date;
}

export interface TenantResponse {
  success: boolean;
  message?: string;
  result?: Tenant;
}

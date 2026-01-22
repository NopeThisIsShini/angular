import { Injectable, signal } from '@angular/core';
import { Tenant } from '../models/tenant.model';
import { LocalStorageService } from './storage/local.storage.service';

@Injectable({
  providedIn: 'root'
})
export class TenantContextService {
  private currentTenant = signal<Tenant | null>(null);
  public currentTenant$ = this.currentTenant.asReadonly();

  constructor(private storageService: LocalStorageService) {
    this.loadTenantFromStorage();
  }

  /**
   * Set the current tenant from header or subdomain
   */
  setCurrentTenant(tenant: Tenant): void {
    this.currentTenant.set(tenant);
    this.storageService.setItem('currentTenant', JSON.stringify(tenant));
  }

  /**
   * Get the current tenant ID
   */
  getCurrentTenantId(): string | null {
    const tenant = this.currentTenant();
    return tenant?.id || null;
  }

  /**
   * Get the current tenant
   */
  getCurrentTenant(): Tenant | null {
    return this.currentTenant();
  }

  /**
   * Get tenant slug from subdomain or header
   */
  getTenantSlugFromUrl(): string | null {
    const hostname = window.location.hostname;
    
    // Extract subdomain for local development: app.localhost -> app
    if (hostname.includes('localhost')) {
      const parts = hostname.split('.');
      return parts.length > 1 ? parts[0] : null;
    }

    // Extract subdomain for production: tenant.example.com -> tenant
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts[0];
    }

    return null;
  }

  /**
   * Load tenant from localStorage
   */
  private loadTenantFromStorage(): void {
    try {
      const tenantData = this.storageService.getItem('currentTenant');
      if (tenantData) {
        const tenant: Tenant = JSON.parse(tenantData);
        this.currentTenant.set(tenant);
      }
    } catch (error) {
      console.warn('Failed to load tenant from storage:', error);
    }
  }

  /**
   * Clear the current tenant
   */
  clearTenant(): void {
    this.currentTenant.set(null);
    this.storageService.removeItem('currentTenant');
  }
}

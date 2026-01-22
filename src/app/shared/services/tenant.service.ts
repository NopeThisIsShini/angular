import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tenant, TenantResponse } from '../models/tenant.model';
import { api_routes } from '@app/utils/routes/api.route';

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  constructor(private http: HttpClient) { }

  /**
   * Get all tenants (admin only)
   */
  getAllTenants(pageNumber?: number, pageSize?: number): Observable<any> {
    let params = new HttpParams();
    if (pageNumber !== undefined) {
      params = params.set('pageNumber', pageNumber.toString());
    }
    if (pageSize !== undefined) {
      params = params.set('pageSize', pageSize.toString());
    }
    return this.http.get<any>(`api/services/app/Tenant`, { params });
  }

  /**
   * Get tenant by ID
   */
  getTenantById(id: string): Observable<TenantResponse> {
    return this.http.get<TenantResponse>(`api/services/app/Tenant/${id}`);
  }

  /**
   * Get current tenant details
   */
  getCurrentTenant(): Observable<TenantResponse> {
    return this.http.get<TenantResponse>(`api/services/app/Tenant/current`);
  }

  /**
   * Create a new tenant
   */
  createTenant(tenant: Partial<Tenant>): Observable<TenantResponse> {
    return this.http.post<TenantResponse>(`api/services/app/Tenant`, tenant);
  }

  /**
   * Update tenant
   */
  updateTenant(id: string, tenant: Partial<Tenant>): Observable<TenantResponse> {
    return this.http.put<TenantResponse>(`api/services/app/Tenant/${id}`, tenant);
  }

  /**
   * Delete tenant
   */
  deleteTenant(id: string): Observable<TenantResponse> {
    return this.http.delete<TenantResponse>(`api/services/app/Tenant/${id}`);
  }

  /**
   * Get tenant by slug (for subdomain lookup)
   */
  getTenantBySlug(slug: string): Observable<TenantResponse> {
    const params = new HttpParams().set('slug', slug);
    return this.http.get<TenantResponse>(`api/services/app/Tenant/slug`, { params });
  }
}


import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TenantService } from '../services/tenant.service';
import { TenantContextService } from '../services/tenant-context.service';
import { Tenant } from '../models/tenant.model';

/**
 * Tenant Resolver
 * Resolves tenant information before activating routes
 * Useful for loading tenant config before page initialization
 */
@Injectable({
  providedIn: 'root'
})
export class TenantResolver implements Resolve<Tenant | null> {
  constructor(
    private tenantService: TenantService,
    private tenantContextService: TenantContextService,
    private router: Router
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Tenant | null> {
    // Check if tenant is already in context
    const currentTenant = this.tenantContextService.getCurrentTenant();
    if (currentTenant) {
      return of(currentTenant);
    }

    // Try to get tenant from subdomain/slug
    const tenantSlug = this.tenantContextService.getTenantSlugFromUrl();
    if (tenantSlug) {
      return this.tenantService.getTenantBySlug(tenantSlug).pipe(
        tap(response => {
          if (response.result) {
            this.tenantContextService.setCurrentTenant(response.result);
          }
        }),
        catchError(() => {
          console.warn('Failed to resolve tenant from slug');
          this.router.navigate(['/notfound']);
          return of(null);
        })
      ) as Observable<Tenant | null>;
    }

    // Try to load current tenant from API
    return this.tenantService.getCurrentTenant().pipe(
      tap(response => {
        if (response.result) {
          this.tenantContextService.setCurrentTenant(response.result);
        }
      }),
      catchError(() => {
        console.warn('Failed to resolve current tenant');
        return of(null);
      })
    ) as Observable<Tenant | null>;
  }
}

import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { TenantContextService } from '../../shared/services/tenant-context.service';

/**
 * Subdomain Tenant Interceptor
 * Extracts tenant information from subdomain or header response
 * Sets tenant context for the application
 * 
 * Supports subdomain strategy: app.localhost, tenant.example.com
 */
export const subdomainTenantInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tenantContextService = inject(TenantContextService);

  return next(req).pipe(
    tap(event => {
      // Check if response contains tenant information in headers
      if (event instanceof HttpResponse) {
        const tenantHeader = event.headers.get('X-Tenant-ID');
        const tenantSlug = tenantContextService.getTenantSlugFromUrl();

        // Log tenant context for debugging (optional)
        if (tenantHeader || tenantSlug) {
          console.debug('Tenant Context - Header:', tenantHeader, 'Slug:', tenantSlug);
        }
      }
    })
  );
};

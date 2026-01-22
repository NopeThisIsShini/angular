import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantContextService } from '../../shared/services/tenant-context.service';

/**
 * Tenant Interceptor
 * Adds tenant identification to HTTP headers for multi-tenant requests
 * Supports: Header-based tenant identification (X-Tenant-ID)
 */
export const tenantInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tenantContextService = inject(TenantContextService);
  const tenantId = tenantContextService.getCurrentTenantId();

  let modifiedReq = req;

  // Add tenant ID to headers if available
  if (tenantId) {
    modifiedReq = req.clone({
      setHeaders: {
        'X-Tenant-ID': tenantId
      }
    });
  }

  return next(modifiedReq);
};

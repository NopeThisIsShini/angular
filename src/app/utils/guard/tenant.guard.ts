import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TenantContextService } from '@app/shared/services/tenant-context.service';

/**
 * Tenant Guard
 * Ensures a tenant is set in the context before allowing route activation
 * Useful for routes that require tenant-specific data
 * 
 * Usage in routes:
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [tenantGuard]
 * }
 */
export const tenantGuard: CanActivateFn = (route, state) => {
  const tenantContextService = inject(TenantContextService);
  const router = inject(Router);

  const currentTenant = tenantContextService.getCurrentTenant();
  const tenantSlug = tenantContextService.getTenantSlugFromUrl();

  // Allow if tenant is already set in context
  if (currentTenant) {
    return true;
  }

  // Allow if tenant slug is detected from URL (will be resolved later)
  if (tenantSlug) {
    return true;
  }

  // Redirect to login/tenant selection if no tenant context
  router.navigate(['/auth/login']);
  return false;
};

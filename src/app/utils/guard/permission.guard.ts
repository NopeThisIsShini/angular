import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionService } from '@app/shared/services';

/**
 * Permission Guard
 * Checks if user has required permissions to access a route
 * 
 * Usage in routes:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [permissionGuard],
 *   data: { permissions: ['Admin.Full', 'Users.Manage'] }
 * }
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

  // If no permissions are required, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has any of the required permissions
  const hasPermission = permissionService.hasAnyPermission(requiredPermissions);

  if (hasPermission) {
    return true;
  }

  // Redirect to unauthorized page if permission denied
  router.navigate(['/unauthorized']);
  return false;
};

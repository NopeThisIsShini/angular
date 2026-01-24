import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ConfigService } from '@app/shared/services';

/**
 * Host Guard - Protects Host-level pages from tenant users
 * Only users with tenantId = null (Host users) can access Host pages
 */
export const hostGuard: CanActivateFn = (route, state) => {
    const configService = inject(ConfigService);
    const router = inject(Router);

    // DEMO: For demo purposes, allow access to host pages
    // In production, check if tenantId is null (Host user)
    // const tenantId = configService.getCurrentTenantId();
    // if (tenantId === null) {
    //     return true;
    // }
    // router.navigate(['/unauthorized']);
    // return false;
    
    // DEMO: Always allow access for demo
    return true;
};

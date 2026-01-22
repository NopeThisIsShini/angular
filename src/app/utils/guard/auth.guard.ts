import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from '../../shared/services/storage/local.storage.service';
import { inject } from '@angular/core';
import { AuthService } from '../../pages/services/api/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.isAuthenticated()) {
        return true;
    } else {
        router.navigate(['/auth']);
        return false;
    }
};

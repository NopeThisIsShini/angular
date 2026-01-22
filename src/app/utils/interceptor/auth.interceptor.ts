import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../shared/services/storage/local.storage.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const headers: { [key: string]: string } = {
        // 'Content-Type': 'application/json',
    };
    const lStorage = inject(LocalStorageService);
    const token = lStorage.getItem('accessToken');
    const router = inject(Router);

    const currentRoute = router.url; // Get the current route

    // if some conditional token need to be added
    if (!currentRoute.includes('/admin')) {
        // headers['Authorization'] = `Bearer ${accessToken}`;
    }

    headers['Authorization'] = `Bearer ${token}`; // global auth token pass

    if (window.location.hostname === 'localhost' || window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1') {
        headers['ngrok-skip-browser-warning'] = '69420';
    }

    const authReq = req.clone({
        setHeaders: headers
    });

    return next(authReq);
};

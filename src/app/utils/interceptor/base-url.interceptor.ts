import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@/environments/environment';

/**
 * Flag to indicate if the request should be directed to the local server
 * rather than the standard API base URL.
 */
export const IS_LOCAL_API = new HttpContextToken<boolean>(() => false);

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    // If the URL is already absolute, we don't need to prepend anything
    if (req.url.includes('://')) {
        return next(req);
    }

    // "Flag-based" structure: choose the base URL from environment
    const isLocal = req.context.get(IS_LOCAL_API);
    const baseUrl = isLocal ? environment.localUrl : environment.apiBaseUrl;

    return next(req.clone({
        url: baseUrl + req.url
    }));
};

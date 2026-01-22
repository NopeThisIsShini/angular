import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    const newBaseUrl = environment.apiBaseUrl;

    // Create the new URL by replacing the old base URL with the new one
    const modifiedUrl = newBaseUrl + req.url;

    // Clone the request and replace the URL with the modified URL
    const modifiedRequest = req.clone({
        url: modifiedUrl
    });
    return next(modifiedRequest);
};

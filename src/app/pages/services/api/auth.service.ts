import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService, LocalStorageService } from '@app/shared/services';
import { api_routes, LOCAL_ROUTES } from '@app/utils/routes';
import { loginRequest, loginResponse, signupRequest, signupResponse } from '@app/pages/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private router: Router,
        private configService: ConfigService
    ) {}

    login(payload: loginRequest): Observable<void> {
        return this.http.post<loginResponse>(api_routes.login, payload).pipe(
            tap((res) => {
                if (res.success) {
                    this.localStorageService.setItem('access_token', res.result.access_token);
                    // this.localStorageService.setItem('encryptedAccessToken', res.result.encryptedAccessToken);
                    // this.localStorageService.setItem('userId', res.result.user.id.toString());
                }
            }),
            switchMap((res) => {
                // Only proceed if login is successful
                if (res.success) {
                    return this.configService.loadUserAndPermissions();
                }

                // Return empty Observable so login() completes cleanly (Error handled globally)
                return EMPTY;
            }),
            take(1)
        );
    }

    signup(payload: signupRequest): Observable<signupResponse> {
        return this.http.post<signupResponse>(api_routes.signup, payload);
    }
    isAuthenticated(): boolean {
        return !!this.localStorageService.getItem('access_token');
    }
    logout() {
        this.localStorageService.clear();
        this.configService.clearUserContext();
        this.router.navigate([LOCAL_ROUTES.AUTH]);
    }
}

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, of, switchMap, tap, map } from 'rxjs';
import { AppInfoResponse, userPreferenceConfig, UserPreferences, UserResult } from '../../models/api/common.model';
import { ApiPermissionResponse } from '../../models/permission.model';
import { layoutConfig } from '@/app/layout/service/layout.service';
import { PermissionService } from '../permission.service';
import { api_routes } from '@/app/utils/routes';
import { LocalStorageService } from '../storage/local.storage.service';
import { IS_LOCAL_API } from '@/app/utils/interceptor/base-url.interceptor';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    currentUser = signal<UserResult | null>(null);
    currentUserId = signal<number | null>(null);

    constructor(
        private http: HttpClient,
        private permissionService: PermissionService,
        private lSService: LocalStorageService
    ) { }

    getUserPreferences(): Observable<UserPreferences> {
        return this.http.get<UserPreferences>(api_routes.userPreferences, {
            context: new HttpContext().set(IS_LOCAL_API, true)
        });
    }

    saveUserPreferences(prefs: userPreferenceConfig): Observable<UserPreferences> {
        return this.http.put<UserPreferences>(api_routes.userPreferences, prefs, {
            context: new HttpContext().set(IS_LOCAL_API, true)
        });
    }

    getCurrentUserInfo(): Observable<AppInfoResponse> {
        // API Call - uncomment for production
        return this.http.get<AppInfoResponse>(`${api_routes.userInfo}`);
        // Local DB for testing
        // return this.http.get<AppInfoResponse>('assets/db/current-user.json');
    }

    loadUserPermissions(userId: number): Observable<void> {
        return this.permissionService.getUserPermissions(userId).pipe(
            tap((apiResponse: ApiPermissionResponse) => {
                this.permissionService.loadPermissionsFromApi(apiResponse);
            }),
            map(() => void 0)
        );
    }

    getAppLayoutConfig(): Observable<any> {
        return this.http.get<any>(api_routes.appUiConfig, {
            context: new HttpContext().set(IS_LOCAL_API, true)
        });
    }

    loadUserAndPermissions(): Observable<void> {
        // Load App Layout config first
        return this.getAppLayoutConfig().pipe(
            tap((config) => {
                // We'll handle pushing this to LayoutService later or here
                (window as any).appUiConfig = config;
            }),
            switchMap(() => {
                if (this.lSService.getItem('access_token')) {
                    return this.getCurrentUserInfo().pipe(
                        tap((appInfoResp: AppInfoResponse) => {
                            this.currentUser.set(appInfoResp.result);
                            const userId = appInfoResp.result?.id ?? null;
                            this.currentUserId.set(userId);
                        }),
                        switchMap((appInfoResp: AppInfoResponse) => {
                            const userId = appInfoResp.result?.id ?? null;
                            return this.loadUserPermissions(userId);
                        })
                    );
                } else {
                    return of(void 0);
                }
            }),
            map(() => void 0)
        );
    }

    clearUserContext(): void {
        this.currentUser.set(null);
        this.currentUserId.set(null);
    }
}

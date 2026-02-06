import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, tap, map } from 'rxjs';
import { AppInfoResponse, userPreferenceConfig, UserPreferences, UserResult } from '../../models/api/common.model';
import { ApiPermissionResponse } from '../../models/permission.model';
import { PermissionService } from '../permission.service';
import { api_routes } from '@/app/utils/routes';
import { LocalStorageService } from '../storage/local.storage.service';
import { IS_LOCAL_API } from '@/app/utils/interceptor/base-url.interceptor';
import { AppStore } from '@/app/store';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private http = inject(HttpClient);
    private permissionService = inject(PermissionService);
    private lSService = inject(LocalStorageService);
    private appStore = inject(AppStore);

    // Publicly expose signals from the store for components that still use ConfigService
    currentUser = this.appStore.user;
    currentUserId = this.appStore.userId;

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
        return this.http.get<AppInfoResponse>(`${api_routes.userInfo}`);
    }

    loadUserPermissions(userId: number): Observable<void> {
        return this.permissionService.getUserPermissions(userId).pipe(
            tap((apiResponse: ApiPermissionResponse) => {
                // PermissionService now automatically syncs with AppStore
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
        this.appStore.setLoading();
        
        return this.getAppLayoutConfig().pipe(
            tap((config) => {
                (window as any).appUiConfig = config;
            }),
            switchMap(() => {
                if (this.lSService.getItem('access_token')) {
                    return this.getCurrentUserInfo().pipe(
                        tap((appInfoResp: AppInfoResponse) => {
                            this.appStore.setUser(appInfoResp.result);
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
            map(() => void 0),
            tap({
                error: (err) => this.appStore.setLoadError(err)
            })
        );
    }

    clearUserContext(): void {
        this.appStore.clear();
    }
}


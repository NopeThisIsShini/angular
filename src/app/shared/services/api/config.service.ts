import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap, tap, map } from 'rxjs';
import { AppInfoResponse, userPreferenceConfig, UserPreferences } from '../../models/api/common.model';
import { ApiPermissionResponse } from '../../models/permission.model';
import { PermissionService } from '../permission.service';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    currentUserId: number | null = null;

    constructor(
        private http: HttpClient,
        private permissionService: PermissionService
    ) {}

    getUserPreferences(): Observable<UserPreferences> {
        return this.http.get<UserPreferences>('assets/db/local.config.json');
    }

    saveUserPreferences(prefs: userPreferenceConfig): Observable<UserPreferences> {
        return this.http.put<UserPreferences>('assets/db/local.config.json', prefs);
    }

    getCurrentUserInfo(): Observable<AppInfoResponse> {
        return this.http.get<AppInfoResponse>('api/services/app/Session/GetCurrentLoginInformations');
    }

    loadUserPermissions(userId: number): Observable<void> {
        return this.permissionService.getUserPermissions(userId).pipe(
            tap((apiResponse: ApiPermissionResponse) => {
                this.permissionService.loadPermissionsFromApi(apiResponse);
            }),
            map(() => void 0)
        );
    }

    loadUserAndPermissions(): Observable<void> {
        return this.getCurrentUserInfo().pipe(
            switchMap((appInfoResp: AppInfoResponse) => {
                const userId = appInfoResp.result.user?.id ?? null;
                this.currentUserId = userId;

                if (userId) {
                    // Chain: Load Permissions (extendable in future)
                    return this.loadUserPermissions(userId);
                }

                // No user logged in → skip permission loading
                return of(void 0);
            })
        );
    }
}

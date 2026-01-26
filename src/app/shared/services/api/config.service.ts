import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap, tap, map } from 'rxjs';
import { AppInfoResponse, userPreferenceConfig, UserPreferences } from '../../models/api/common.model';
import { ApiPermissionResponse } from '../../models/permission.model';
import { PermissionService } from '../permission.service';
import { api_routes } from '@app/utils/routes';
import { LocalStorageService } from '../storage/local.storage.service';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    currentUserId: number | null = null;

    constructor(
        private http: HttpClient,
        private permissionService: PermissionService,
        private lSService: LocalStorageService
    ) {}

    getUserPreferences(): Observable<UserPreferences> {
        return this.http.get<UserPreferences>('assets/db/local.config.json');
    }

    saveUserPreferences(prefs: userPreferenceConfig): Observable<UserPreferences> {
        return this.http.put<UserPreferences>('assets/db/local.config.json', prefs);
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

    loadUserAndPermissions(): Observable<void> {
        if(this.lSService.getItem('accessToken')){
             return this.getCurrentUserInfo().pipe(
            switchMap((appInfoResp: AppInfoResponse) => {
                const userId = appInfoResp.result.user?.id ?? null;
                this.currentUserId = userId;

                // if (userId) {
                    // Chain: Load Permissions (extendable in future)
                    return this.loadUserPermissions(userId);
                // }

                // No user logged in → skip permission loading
                // return of(void 0);
            })
        );
        }else{
            return of(void 0);
        }
       
    }
}

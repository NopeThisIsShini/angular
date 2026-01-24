import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap, tap, map } from 'rxjs';
import { AppInfoResponse, userPreferenceConfig, UserPreferences } from '../../models/api/common.model';
import { ApiPermissionResponse } from '../../models/permission.model';
import { PermissionService } from '../permission.service';
import { OUScopingService } from '../ou-scoping.service';
import { LocalStorageService } from '../storage/local.storage.service';
import { UserScopeContext } from '../../models/ou-scoping.model';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    currentUserId: number | null = null;
    currentUserContext: UserScopeContext | null = null;

    constructor(
        private http: HttpClient,
        private permissionService: PermissionService,
        private ouScopingService: OUScopingService,
        private localStorageService: LocalStorageService
    ) {}

    getUserPreferences(): Observable<UserPreferences> {
        return this.http.get<UserPreferences>('assets/db/local.config.json');
    }

    saveUserPreferences(prefs: userPreferenceConfig): Observable<UserPreferences> {
        return this.http.put<UserPreferences>('assets/db/local.config.json', prefs);
    }

    /**
     * Get the correct session file based on the selected demo profile
     * Profiles: 'host', 'tata-group', 'titan'
     */
    private getSessionFilePath(): string {
        const profile = this.localStorageService.getItem('demoSessionProfile');
        
        switch (profile) {
            case 'host':
                return 'assets/db/session-host.json';
            case 'tata-group':
                return 'assets/db/session-tata-group.json';
            case 'titan':
                return 'assets/db/session-titan.json';
            default:
                // Default to session.json for backwards compatibility
                return 'assets/db/session.json';
        }
    }

    getCurrentUserInfo(): Observable<AppInfoResponse> {
        const sessionFile = this.getSessionFilePath();
        console.log(`[ConfigService] Loading session from: ${sessionFile}`);
        return this.http.get<AppInfoResponse>(sessionFile);
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
                const user = appInfoResp.result.user;
                const userId = user?.id ?? null;
                this.currentUserId = userId;

                // Initialize OU Scoping with user context
                if (user) {
                    this.currentUserContext = {
                        id: user.id,
                        userName: user.userName,
                        roleNames: (user as any).roleNames || [],
                        organizationUnitId: (user as any).organizationUnitId || null,
                        organizationUnitPath: (user as any).organizationUnitPath || null,
                        organizationUnitName: (user as any).organizationUnitName || null
                    };
                    
                    this.ouScopingService.setCurrentUser(this.currentUserContext);
                    console.log(`[ConfigService] OU Scope initialized: ${this.currentUserContext.organizationUnitPath || 'HOST (no limit)'}`);
                }

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


// ou-scoping.service.ts
// Enterprise-grade OU Scoping Service implementing Materialized Path pattern

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import {
    UserScopeContext,
    ScopedDataObject,
    ScopeCheckResult,
    ScopingMode,
    OUScopingConfig,
    ScopedFilterResult
} from '../models/ou-scoping.model';

interface SessionResponse {
    result: {
        user: UserScopeContext;
        tenant?: any;
    };
}

@Injectable({
    providedIn: 'root'
})
export class OUScopingService {
    private currentUserContext$ = new BehaviorSubject<UserScopeContext | null>(null);
    private config: OUScopingConfig = {
        mode: 'descendants',
        allowNullPaths: false,
        strictMode: false
    };

    constructor(private http: HttpClient) {}

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize the scoping service with current user session
     */
    initializeFromSession(): Observable<UserScopeContext> {
        return this.http.get<SessionResponse>('assets/db/session.json').pipe(
            map(response => {
                const user = response.result.user as UserScopeContext;
                return user;
            }),
            tap(user => this.setCurrentUser(user))
        );
    }

    /**
     * Set the current user context manually
     */
    setCurrentUser(user: UserScopeContext): void {
        this.currentUserContext$.next(user);
        console.log(`[OUScoping] User scope set: ${user.userName} @ ${user.organizationUnitPath}`);
    }

    /**
     * Get current user context as observable
     */
    getCurrentUser$(): Observable<UserScopeContext | null> {
        return this.currentUserContext$.asObservable();
    }

    /**
     * Get current user context synchronously
     */
    getCurrentUser(): UserScopeContext | null {
        return this.currentUserContext$.getValue();
    }

    /**
     * Update scoping configuration
     */
    setConfig(config: Partial<OUScopingConfig>): void {
        this.config = { ...this.config, ...config };
    }

    // ========================================================================
    // CORE SCOPING LOGIC - THE GOLDEN RULE
    // ========================================================================

    /**
     * THE GOLDEN RULE: Check if user can access target path
     * User's path must be a PREFIX of target's path
     * 
     * Examples:
     *   User: /1/2/    Target: /1/2/5/8/  → ✅ ALLOWED (descendant)
     *   User: /1/2/5/  Target: /1/2/      → ❌ BLOCKED (ancestor)
     *   User: /1/3/    Target: /1/2/5/    → ❌ BLOCKED (different branch)
     */
    canAccessPath(userPath: string, targetPath: string): ScopeCheckResult {
        // Handle null/empty paths
        if (!targetPath) {
            return {
                hasAccess: this.config.allowNullPaths,
                reason: this.config.allowNullPaths ? 'Null paths are accessible' : 'Target path is empty',
                userPath,
                targetPath: targetPath || '(empty)'
            };
        }

        // HOST ADMIN: null/empty user path means access to EVERYTHING
        if (!userPath) {
            return {
                hasAccess: true,
                reason: 'Host admin - no OU restrictions',
                userPath: '(host)',
                targetPath
            };
        }

        // Normalize paths
        const normalizedUserPath = this.normalizePath(userPath);
        const normalizedTargetPath = this.normalizePath(targetPath);

        let hasAccess = false;
        let reason = '';

        switch (this.config.mode) {
            case 'descendants':
                // User can access their OU and all children
                hasAccess = normalizedTargetPath.startsWith(normalizedUserPath);
                reason = hasAccess 
                    ? `Target ${targetPath} is within user's scope ${userPath}` 
                    : `Target ${targetPath} is outside user's scope ${userPath}`;
                break;

            case 'descendants-only':
                // User can access only children, not their exact OU
                hasAccess = normalizedTargetPath.startsWith(normalizedUserPath) 
                         && normalizedTargetPath !== normalizedUserPath;
                reason = hasAccess 
                    ? `Target ${targetPath} is a descendant of ${userPath}` 
                    : `Target ${targetPath} is not a descendant of ${userPath}`;
                break;

            case 'ancestors':
                // User can access their OU and all parents (reverse logic)
                hasAccess = normalizedUserPath.startsWith(normalizedTargetPath);
                reason = hasAccess 
                    ? `Target ${targetPath} is an ancestor of user's scope` 
                    : `Target ${targetPath} is not an ancestor`;
                break;

            case 'exact':
                // User can only access exact OU match
                hasAccess = normalizedUserPath === normalizedTargetPath;
                reason = hasAccess 
                    ? `Exact OU match` 
                    : `Target ${targetPath} does not exactly match ${userPath}`;
                break;

            case 'siblings':
                // User can access OUs with the same parent
                const userParent = this.getParentPath(normalizedUserPath);
                const targetParent = this.getParentPath(normalizedTargetPath);
                hasAccess = userParent === targetParent;
                reason = hasAccess 
                    ? `Target ${targetPath} is a sibling` 
                    : `Target ${targetPath} is not a sibling`;
                break;
        }

        return { hasAccess, reason, userPath: normalizedUserPath, targetPath: normalizedTargetPath };
    }

    /**
     * Check if current user can access a specific data object
     */
    canAccessObject(target: ScopedDataObject): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // Host admin (null path) can access everything
        if (!user.organizationUnitPath) return true;
        
        return this.canAccessPath(user.organizationUnitPath, target.organizationUnitPath).hasAccess;
    }

    /**
     * Check if current user can access a specific OU path
     */
    canAccess(targetPath: string): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // Host admin (null path) can access everything
        if (!user.organizationUnitPath) return true;
        
        return this.canAccessPath(user.organizationUnitPath, targetPath).hasAccess;
    }

    /**
     * Check access with detailed result
     */
    checkAccess(targetPath: string): ScopeCheckResult {
        const user = this.getCurrentUser();
        if (!user) {
            return {
                hasAccess: false,
                reason: 'No user context available',
                userPath: '(none)',
                targetPath
            };
        }
        
        return this.canAccessPath(user.organizationUnitPath, targetPath);
    }

    // ========================================================================
    // FILTERING - Apply scope to collections
    // ========================================================================

    /**
     * Filter a list of scoped objects by current user's OU scope
     */
    filterByScope<T extends ScopedDataObject>(items: T[]): ScopedFilterResult<T> {
        const user = this.getCurrentUser();
        if (!user) {
            return {
                items: [],
                totalCount: items.length,
                filteredCount: 0,
                scopePath: '(no user)'
            };
        }

        // Host admin (null path) sees everything
        if (!user.organizationUnitPath) {
            return {
                items: items,
                totalCount: items.length,
                filteredCount: items.length,
                scopePath: '(host - no limit)'
            };
        }

        const filteredItems = items.filter(item => 
            this.canAccessPath(user.organizationUnitPath, item.organizationUnitPath).hasAccess
        );

        return {
            items: filteredItems,
            totalCount: items.length,
            filteredCount: filteredItems.length,
            scopePath: user.organizationUnitPath
        };
    }

    /**
     * Filter items with a custom path accessor
     */
    filterByPath<T>(items: T[], pathAccessor: (item: T) => string): T[] {
        const user = this.getCurrentUser();
        if (!user) return [];
        
        // Host admin (null path) sees everything
        if (!user.organizationUnitPath) return items;

        return items.filter(item => 
            this.canAccessPath(user.organizationUnitPath, pathAccessor(item)).hasAccess
        );
    }

    // ========================================================================
    // PATH UTILITIES
    // ========================================================================

    /**
     * Normalize path to ensure consistent format: /1/2/3/
     */
    normalizePath(path: string): string {
        if (!path) return '';
        let normalized = path.trim();
        if (!normalized.startsWith('/')) normalized = '/' + normalized;
        if (!normalized.endsWith('/')) normalized = normalized + '/';
        return normalized;
    }

    /**
     * Get parent path: /1/2/3/ → /1/2/
     */
    getParentPath(path: string): string {
        const normalized = this.normalizePath(path);
        const parts = normalized.split('/').filter(p => p);
        if (parts.length <= 1) return '/';
        parts.pop();
        return '/' + parts.join('/') + '/';
    }

    /**
     * Get depth level of path: /1/2/3/ → 3
     */
    getPathDepth(path: string): number {
        const normalized = this.normalizePath(path);
        return normalized.split('/').filter(p => p).length;
    }

    /**
     * Get all ancestor paths: /1/2/3/ → ['/1/', '/1/2/', '/1/2/3/']
     */
    getAncestorPaths(path: string): string[] {
        const normalized = this.normalizePath(path);
        const parts = normalized.split('/').filter(p => p);
        const ancestors: string[] = [];
        
        for (let i = 1; i <= parts.length; i++) {
            ancestors.push('/' + parts.slice(0, i).join('/') + '/');
        }
        
        return ancestors;
    }

    /**
     * Check if paths share a common ancestor
     */
    shareCommonAncestor(path1: string, path2: string, minDepth: number = 1): boolean {
        const ancestors1 = this.getAncestorPaths(path1);
        const ancestors2 = this.getAncestorPaths(path2);
        
        return ancestors1.some(a => 
            this.getPathDepth(a) >= minDepth && ancestors2.includes(a)
        );
    }

    /**
     * Get the common ancestor between two paths
     */
    getCommonAncestor(path1: string, path2: string): string {
        const ancestors1 = this.getAncestorPaths(path1);
        const ancestors2 = new Set(this.getAncestorPaths(path2));
        
        // Find the deepest common ancestor
        for (let i = ancestors1.length - 1; i >= 0; i--) {
            if (ancestors2.has(ancestors1[i])) {
                return ancestors1[i];
            }
        }
        
        return '/';
    }

    // ========================================================================
    // DEBUG & LOGGING
    // ========================================================================

    /**
     * Get a visual representation of access for debugging
     */
    debugAccess(targets: string[]): void {
        const user = this.getCurrentUser();
        console.group(`[OUScoping] Access Check for ${user?.userName || '(no user)'} @ ${user?.organizationUnitPath || '(no path)'}`);
        
        targets.forEach(target => {
            const result = this.checkAccess(target);
            console.log(
                `${result.hasAccess ? '✅' : '❌'} ${target} - ${result.reason}`
            );
        });
        
        console.groupEnd();
    }
}

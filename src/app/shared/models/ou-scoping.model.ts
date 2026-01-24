// ou-scoping.model.ts
// Complete type definitions for OU-based hierarchical access control

/**
 * User context for OU scoping - contains the user's scope information
 */
export interface UserScopeContext {
    id: number;
    userName: string;
    roleNames: string[];                // Functional abilities (e.g., ['Admin', 'Manager'])
    organizationUnitId: number | null;  // The OU ID user belongs to
    organizationUnitPath: string;       // Hierarchical scope (e.g., '/1/2/')
    organizationUnitName: string;       // Display name of the OU
}

/**
 * Any data object that can be scoped to an OU
 */
export interface ScopedDataObject {
    id: number;
    organizationUnitId?: number | null;
    organizationUnitPath: string;       // The "room" it belongs to (e.g., '/1/2/5/')
    [key: string]: any;                 // Allow other properties
}

/**
 * Result of a scope check
 */
export interface ScopeCheckResult {
    hasAccess: boolean;
    reason: string;
    userPath: string;
    targetPath: string;
}

/**
 * Scoping mode for different use cases
 */
export type ScopingMode = 
    | 'descendants'     // User can access their OU and all descendants (default)
    | 'descendants-only'// User can access only descendants, not their own OU
    | 'ancestors'       // User can access their OU and all ancestors (reverse)
    | 'exact'           // User can only access exact OU match
    | 'siblings';       // User can access siblings in the same parent

/**
 * Configuration for the OU scoping service
 */
export interface OUScopingConfig {
    mode: ScopingMode;
    allowNullPaths: boolean;            // If true, null paths are accessible by all
    strictMode: boolean;                // If true, throw errors on invalid paths
}

/**
 * Filter result containing scoped items
 */
export interface ScopedFilterResult<T> {
    items: T[];
    totalCount: number;
    filteredCount: number;
    scopePath: string;
}

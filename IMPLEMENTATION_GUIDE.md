# Implementation Guide - Multi-Tenant RBAC Architecture

## Overview

The critical and high-priority features have been implemented following your barrel file structure and maintaining your existing folder organization (utils as core, pages as features).

## What's Been Implemented

### 1. **Tenant Model** ✅
**File:** [src/app/shared/models/tenant.model.ts](src/app/shared/models/tenant.model.ts)

```typescript
interface Tenant {
  id: string;
  name: string;
  slug: string;                    // For subdomain lookup
  status: 'active' | 'suspended' | 'trial' | 'expired';
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  settings: TenantSettings;
  createdAt: Date;
  expiresAt?: Date;
}
```

### 2. **Tenant Service** ✅
**File:** [src/app/shared/services/tenant.service.ts](src/app/shared/services/tenant.service.ts)

Provides tenant lifecycle management:
```typescript
// Usage examples
tenantService.getAllTenants()                    // Admin: List all tenants
tenantService.getTenantById(id)                 // Get tenant by ID
tenantService.getCurrentTenant()                // Get current tenant
tenantService.getTenantBySlug(slug)            // For subdomain strategy
tenantService.createTenant(data)                // Create new tenant
tenantService.updateTenant(id, data)           // Update tenant
tenantService.deleteTenant(id)                 // Delete tenant
```

### 3. **Tenant Context Service** ✅
**File:** [src/app/shared/services/tenant-context.service.ts](src/app/shared/services/tenant-context.service.ts)

Manages current tenant state using Angular Signals:
```typescript
// Usage in components
constructor(private tenantContext: TenantContextService) {}

// Get current tenant as signal
const currentTenant = this.tenantContext.currentTenant$;

// Get tenant ID
const tenantId = this.tenantContext.getCurrentTenantId();

// Get tenant slug from subdomain/path
const slug = this.tenantContext.getTenantSlugFromUrl();
```

### 4. **Tenant Identification Strategy** ✅

**Header-based + Subdomain Support:**
- `X-Tenant-ID` header automatically added by interceptor
- Subdomain extraction for local: `app.localhost` → `app`
- Subdomain extraction for production: `tenant.example.com` → `tenant`

**Files:**
- [src/app/utils/interceptor/tenant.interceptor.ts](src/app/utils/interceptor/tenant.interceptor.ts) - Adds tenant ID to headers
- [src/app/utils/interceptor/subdomain-tenant.interceptor.ts](src/app/utils/interceptor/subdomain-tenant.interceptor.ts) - Handles subdomain resolution

### 5. **Permission Guard** ✅
**File:** [src/app/utils/guard/permission.guard.ts](src/app/utils/guard/permission.guard.ts)

Protects routes by checking required permissions:
```typescript
// In your routes
{
  path: 'admin/users',
  component: UsersComponent,
  canActivate: [permissionGuard],
  data: { permissions: ['Users.Manage', 'Users.Create'] }
}

// Usage with hasAnyPermission or hasAllPermissions
// Guard checks if user has ANY of the specified permissions
```

### 6. **Tenant Guard** ✅
**File:** [src/app/utils/guard/tenant.guard.ts](src/app/utils/guard/tenant.guard.ts)

Ensures tenant context is set before route activation:
```typescript
// In your routes
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [tenantGuard]
}
```

### 7. **Tenant Resolver** ✅
**File:** [src/app/shared/services/tenant.resolver.ts](src/app/shared/services/tenant.resolver.ts)

Resolves tenant data before route activation:
```typescript
// In your routes (optional)
{
  path: 'tenant-details',
  component: TenantDetailsComponent,
  resolve: { tenant: TenantResolver }
}
```

### 8. **Permission Directive** ✅
**File:** [src/app/shared/directives/has-permission.directive.ts](src/app/shared/directives/has-permission.directive.ts)

Already implemented - use for conditional rendering:
```html
<!-- Show button only if user has permission -->
<button *appHasPermission="'Users.Create'">Add User</button>

<!-- Check multiple permissions -->
<div *appHasPermission="['Users.Edit', 'Users.Delete']">
  Edit and Delete Controls
</div>
```

## HTTP Interceptor Chain (Updated)

**File:** [src/app.config.ts](src/app.config.ts)

```typescript
withInterceptors([
  baseUrlInterceptor,      // Base URL handling
  tenantInterceptor,       // Adds X-Tenant-ID header
  errorInterceptor,        // Error handling
  authInterceptor         // Bearer token
])
```

**Order matters!** Tenant interceptor runs before auth to ensure tenant context is available.

---

## Integration Examples

### Example 1: Using Tenant Service in a Component

```typescript
import { Component, OnInit } from '@angular/core';
import { TenantService, TenantContextService } from '@app/shared/services';

@Component({
  selector: 'app-tenant-dashboard',
  template: `
    <h1>{{ currentTenant()?.name }}</h1>
    <p>Plan: {{ currentTenant()?.subscriptionTier }}</p>
    <button (click)="loadTenantDetails()">Refresh</button>
  `
})
export class TenantDashboardComponent implements OnInit {
  currentTenant = this.tenantContext.currentTenant$;

  constructor(
    private tenantService: TenantService,
    private tenantContext: TenantContextService
  ) {}

  ngOnInit() {
    this.tenantService.getCurrentTenant().subscribe(response => {
      if (response.result) {
        this.tenantContext.setCurrentTenant(response.result);
      }
    });
  }

  loadTenantDetails() {
    this.tenantService.getCurrentTenant().subscribe(
      response => console.log('Tenant:', response.result)
    );
  }
}
```

### Example 2: Using Permission Guard in Routes

```typescript
// In your pages.routes.ts or app.routes.ts
export const routes: Routes = [
  {
    path: 'administration',
    canActivate: [tenantGuard, authGuard],
    children: [
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['Users.Manage'] }
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['Roles.Manage'] }
      },
      {
        path: 'permissions',
        component: PermissionsComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['Permissions.Manage'] }
      }
    ]
  }
];
```

### Example 3: Subdomain-Based Tenant Resolution

For `app.localhost` or `tenant1.example.com`:

```typescript
// Automatic resolution in TenantContextService
const slug = this.tenantContext.getTenantSlugFromUrl(); // Returns 'app' or 'tenant1'

// Then load tenant by slug
this.tenantService.getTenantBySlug(slug).subscribe(response => {
  if (response.result) {
    this.tenantContext.setCurrentTenant(response.result);
  }
});
```

### Example 4: Permission-Based Template Rendering

```html
<div class="admin-panel">
  <!-- Show user management only if user has permission -->
  <section *appHasPermission="'Users.Manage'">
    <h2>User Management</h2>
    <button *appHasPermission="'Users.Create'">Add User</button>
    <table>
      <tr *ngFor="let user of users">
        <td>{{ user.name }}</td>
        <td>
          <button *appHasPermission="'Users.Edit'">Edit</button>
          <button *appHasPermission="'Users.Delete'">Delete</button>
        </td>
      </tr>
    </table>
  </section>

  <!-- Show role management only if user has permission -->
  <section *appHasPermission="'Roles.Manage'">
    <h2>Role Management</h2>
    <!-- role management UI -->
  </section>
</div>
```

---

## Angular CLI Integration

These features use Angular's built-in:
- **Standalone APIs** (no module needed)
- **Dependency Injection** via `providedIn: 'root'`
- **Signals** for reactive state management
- **Functional Guards** (CanActivateFn)
- **Functional Resolvers** (Resolve)
- **Functional Interceptors** (HttpInterceptorFn)
- **Directives** with @Input bindings

---

## Barrel File Structure Maintained

✅ **Core (utils):**
- `src/app/utils/interceptor/` - Interceptors including tenant.interceptor
- `src/app/utils/guard/` - Guards including permission.guard, tenant.guard
- `src/app/utils/routes/` - Route definitions
- All exports via `index.ts` barrel files

✅ **Features (pages):**
- `src/app/pages/` - Feature modules maintained as-is
- Can use all new services/guards/directives

✅ **Shared:**
- `src/app/shared/models/` - tenant.model added
- `src/app/shared/services/` - Tenant services added
- `src/app/shared/directives/` - has-permission.directive (already exists)

---

## Configuration Notes

### Angular.json - Subdomain Support
Your `angular.json` already has:
```json
"serve": {
  "options": {
    "host": "0.0.0.0",
    "allowedHosts": ["app.localhost", "admin.localhost"]
  }
}
```

This allows testing subdomain-based tenant resolution locally.

---

## Next Steps (Optional - Medium/Low Priority)

If you need additional features:

1. **Token Refresh Mechanism** - Auto-refresh tokens on 401
2. **Caching Layer** - Cache API responses for permissions, tenant config
3. **State Management** - Consider NgRx SignalStore for complex state
4. **CSRF Protection** - Coordinate with backend for token storage

These are NOT implemented yet as per your requirement to focus on critical/high-priority items only.

---

## API Endpoint Expectations

Your backend should support:

```
GET    /api/services/app/Tenant                      // List all tenants (admin)
GET    /api/services/app/Tenant/:id                  // Get tenant by ID
GET    /api/services/app/Tenant/current              // Get current tenant
GET    /api/services/app/Tenant/slug?slug=:slug      // Get tenant by slug
POST   /api/services/app/Tenant                      // Create tenant
PUT    /api/services/app/Tenant/:id                  // Update tenant
DELETE /api/services/app/Tenant/:id                  // Delete tenant

Headers:
X-Tenant-ID: {tenantId}  // Added automatically by interceptor
```

---

## Testing Your Implementation

1. **Test Tenant Context:**
   ```typescript
   const slug = tenantContext.getTenantSlugFromUrl(); // Should return 'app' or 'admin'
   ```

2. **Test Permission Guard:**
   ```typescript
   // Component protected with data: { permissions: ['Users.Manage'] }
   permissionService.hasAnyPermission(['Users.Manage']); // Should return true/false
   ```

3. **Test Tenant Interceptor:**
   ```typescript
   // Make HTTP request - should include X-Tenant-ID header
   http.get('/api/...'); // Header added automatically
   ```

---

## Summary

✅ **Implemented (Critical/High Priority):**
- Tenant Model & Service
- Tenant Context State Management
- Permission Guard with Route Protection
- Tenant Guard with Context Checking
- Tenant Resolver for Pre-Route Loading
- Tenant Interceptor (Header + Subdomain)
- Subdomain Tenant Interceptor
- Barrel File Updates
- HTTP Interceptor Chain Integration

❌ **Not Implemented (Low/Medium Priority):**
- Token Refresh Mechanism
- HTTP Caching Layer
- State Management (NgRx/Akita)
- CSRF Protection

All features follow your existing structure and use Angular's latest APIs and best practices.

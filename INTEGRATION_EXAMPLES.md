# Integration Examples for Your Project

## How to Use in Your Pages (Features)

Since your folder structure has:
- `utils/` as core (guards, interceptors, constants)
- `pages/` as features (account, administration, auth, etc.)

Here's how to integrate the new features:

---

## Example 1: Administration Pages with Permission Protection

### File: `src/app/pages/administration/administration.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { permissionGuard, tenantGuard, authGuard } from '@app/utils/guard';
import { AdministrationComponent } from './administration.component';
import { UsersComponent } from './components/users/users.component';
import { RolesComponent } from './components/roles/roles.component';

export const administrationRoutes: Routes = [
  {
    path: '',
    component: AdministrationComponent,
    canActivate: [tenantGuard, authGuard],
    children: [
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [permissionGuard],
        data: { 
          permissions: ['Users.Manage'],
          breadcrumb: 'User Management'
        }
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [permissionGuard],
        data: { 
          permissions: ['Roles.Manage'],
          breadcrumb: 'Role Management'
        }
      },
      {
        path: 'permissions',
        component: PermissionsComponent,
        canActivate: [permissionGuard],
        data: { 
          permissions: ['Permissions.Manage'],
          breadcrumb: 'Permission Management'
        }
      }
    ]
  }
];
```

---

## Example 2: Users Component with Tenant & Permission Filtering

### File: `src/app/pages/administration/components/users/users.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TenantContextService, PermissionService } from '@app/shared/services';
import { Tenant } from '@app/shared/models';

@Component({
  selector: 'app-users',
  standalone: true,
  template: `
    <div class="users-container">
      <div class="header">
        <h1>User Management - {{ currentTenant()?.name }}</h1>
        
        <!-- Show add button only if user has create permission -->
        <button 
          *appHasPermission="'Users.Create'" 
          (click)="openAddUserDialog()"
          class="btn btn-primary">
          Add User
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <!-- Show edit button only if user has edit permission -->
              <button 
                *appHasPermission="'Users.Edit'" 
                (click)="editUser(user)">
                Edit
              </button>
              
              <!-- Show delete button only if user has delete permission -->
              <button 
                *appHasPermission="'Users.Delete'" 
                (click)="deleteUser(user)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private tenantContext = inject(TenantContextService);
  private permissionService = inject(PermissionService);

  // Expose current tenant as signal
  currentTenant = this.tenantContext.currentTenant$;
  
  users: any[] = [];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // The X-Tenant-ID header is automatically added by tenantInterceptor
    this.http.get<any>('/api/services/app/User').subscribe(
      response => {
        this.users = response.result;
      }
    );
  }

  openAddUserDialog() {
    // Check permission before opening
    if (!this.permissionService.hasPermission('Users.Create')) {
      console.warn('You do not have permission to create users');
      return;
    }
    // Open dialog...
  }

  editUser(user: any) {
    if (!this.permissionService.hasPermission('Users.Edit')) {
      console.warn('You do not have permission to edit users');
      return;
    }
    // Edit user...
  }

  deleteUser(user: any) {
    if (!this.permissionService.hasPermission('Users.Delete')) {
      console.warn('You do not have permission to delete users');
      return;
    }
    // Delete user...
  }
}
```

---

## Example 3: Tenant-Aware Dashboard in Landing/Account

### File: `src/app/pages/landing/landing.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { TenantService, TenantContextService } from '@app/shared/services';
import { Tenant } from '@app/shared/models';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <div class="landing">
      <div *ngIf="currentTenant()">
        <h1>Welcome to {{ currentTenant()?.name }}!</h1>
        <p>Plan: {{ currentTenant()?.subscriptionTier | uppercase }}</p>
        <p>Max Users: {{ currentTenant()?.settings.maxUsers }}</p>
        
        <!-- Show premium features only for pro/enterprise -->
        <div *ngIf="isPremiumPlan()">
          <h2>Premium Features</h2>
          <!-- Premium content -->
        </div>
      </div>
    </div>
  `
})
export class LandingComponent implements OnInit {
  private tenantService = inject(TenantService);
  private tenantContext = inject(TenantContextService);

  currentTenant = this.tenantContext.currentTenant$;

  ngOnInit() {
    // Load tenant details if not already loaded
    if (!this.currentTenant()) {
      this.tenantService.getCurrentTenant().subscribe(
        response => {
          if (response.result) {
            this.tenantContext.setCurrentTenant(response.result);
          }
        }
      );
    }
  }

  isPremiumPlan(): boolean {
    const tenant = this.currentTenant();
    return tenant?.subscriptionTier === 'pro' || 
           tenant?.subscriptionTier === 'enterprise';
  }
}
```

---

## Example 4: Account Settings with Tenant Configuration

### File: `src/app/pages/account/account.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { tenantGuard, authGuard, permissionGuard } from '@app/utils/guard';
import { AccountComponent } from './account.component';
import { TenantSettingsComponent } from './components/tenant-settings/tenant-settings.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const accountRoutes: Routes = [
  {
    path: '',
    component: AccountComponent,
    canActivate: [tenantGuard, authGuard],
    children: [
      {
        path: 'profile',
        component: UserProfileComponent
      },
      {
        path: 'tenant-settings',
        component: TenantSettingsComponent,
        canActivate: [permissionGuard],
        data: { 
          permissions: ['Tenant.Manage'],
          breadcrumb: 'Tenant Settings'
        }
      }
    ]
  }
];
```

### File: `src/app/pages/account/components/tenant-settings/tenant-settings.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TenantService, TenantContextService } from '@app/shared/services';
import { Tenant, TenantSettings } from '@app/shared/models';

@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  template: `
    <div class="tenant-settings">
      <h1>Tenant Settings - {{ currentTenant()?.name }}</h1>
      
      <form [formGroup]="settingsForm" (ngSubmit)="saveTenantSettings()">
        <div class="form-group">
          <label>Max Users</label>
          <input 
            type="number" 
            formControlName="maxUsers"
            class="form-control">
        </div>

        <div class="form-group">
          <label>Primary Color (Branding)</label>
          <input 
            type="color" 
            formControlName="primaryColor"
            class="form-control">
        </div>

        <button type="submit" class="btn btn-primary">
          Save Settings
        </button>
      </form>
    </div>
  `
})
export class TenantSettingsComponent implements OnInit {
  private tenantService = inject(TenantService);
  private tenantContext = inject(TenantContextService);
  private fb = inject(FormBuilder);

  currentTenant = this.tenantContext.currentTenant$;
  settingsForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    const tenant = this.currentTenant();
    if (!tenant) return;

    this.settingsForm = this.fb.group({
      maxUsers: [tenant.settings.maxUsers, Validators.required],
      primaryColor: [tenant.settings.branding?.primaryColor || '#000000']
    });
  }

  saveTenantSettings() {
    if (!this.settingsForm.valid) return;

    const tenant = this.currentTenant();
    if (!tenant) return;

    const updatedTenant: Partial<Tenant> = {
      settings: {
        ...tenant.settings,
        maxUsers: this.settingsForm.get('maxUsers')?.value,
        branding: {
          ...tenant.settings.branding,
          primaryColor: this.settingsForm.get('primaryColor')?.value
        }
      }
    };

    // Tenant ID automatically added to header via interceptor
    this.tenantService.updateTenant(tenant.id, updatedTenant).subscribe(
      response => {
        if (response.result) {
          this.tenantContext.setCurrentTenant(response.result);
        }
      }
    );
  }
}
```

---

## Example 5: Authentication with Tenant Assignment

### File: `src/app/pages/auth/auth.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TenantContextService } from '@app/shared/services';

@Component({
  selector: 'app-auth',
  standalone: true,
  template: `
    <form (ngSubmit)="login()">
      <input [(ngModel)]="email" name="email" placeholder="Email">
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password">
      <button type="submit">Login</button>
    </form>
  `
})
export class AuthComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tenantContext = inject(TenantContextService);

  email = '';
  password = '';

  login() {
    this.http.post<any>('/api/services/app/Auth/Login', {
      email: this.email,
      password: this.password
    }).subscribe(response => {
      // Backend should return tenant info in response
      if (response.result.tenant) {
        this.tenantContext.setCurrentTenant(response.result.tenant);
      }

      // Navigate to dashboard/home
      this.router.navigate(['/dashboard']);
    });
  }
}
```

---

## Example 6: Template-Based Permission Management

### File: Any template in your pages

```html
<!-- Show user-only content -->
<div *appHasPermission="'Users.View'">
  <h2>User List</h2>
  <!-- user list content -->
</div>

<!-- Show admin-only content -->
<div *appHasPermission="'Admin.Full'">
  <h2>Admin Panel</h2>
  <!-- admin controls -->
</div>

<!-- Show for multiple permissions (ANY) -->
<button *appHasPermission="['Users.Create', 'Bulk.Upload']">
  Add Users
</button>

<!-- Show for multiple permissions (ALL) - requires custom directive variant -->
<!-- Current directive uses hasAllPermissions in the code -->
<div *appHasPermission="['Users.Edit', 'Users.Approve']">
  Edit and Approve Users
</div>
```

---

## Quick Integration Checklist

- [ ] Import `TenantContextService` in components needing tenant info
- [ ] Use `tenantGuard` on routes that require tenant context
- [ ] Use `permissionGuard` with `data: { permissions: [...] }` for protected routes
- [ ] Use `*appHasPermission` directive in templates
- [ ] Ensure backend returns tenant in login response
- [ ] Test with subdomain URLs: `http://app.localhost:4200`
- [ ] Verify `X-Tenant-ID` header in Network tab of dev tools

---

## Import Paths (Barrel Files)

```typescript
// From services barrel
import { 
  TenantService, 
  TenantContextService,
  TenantResolver 
} from '@app/shared/services';

// From models barrel
import { 
  Tenant, 
  TenantSettings,
  TenantBranding 
} from '@app/shared/models';

// From guard barrel
import { 
  permissionGuard, 
  tenantGuard,
  authGuard 
} from '@app/utils/guard';

// From interceptor barrel (in app.config)
import { 
  tenantInterceptor,
  subdomainTenantInterceptor 
} from '@app/utils/interceptor';
```

All paths use `@app/` alias for clean imports!

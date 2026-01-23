# Step-by-Step File Changes Guide

> This document lists ALL file changes needed with descriptions of what each should contain.

---

## 📁 Folder Structure to Create

```
src/app/
├── pages/
│   ├── host/                          ← NEW FOLDER (Phase 0)
│   │   ├── host.routes.ts
│   │   ├── dashboard/
│   │   ├── tenants/
│   │   └── editions/
│   ├── models/api/
│   │   ├── tenant.model.ts            ← NEW (Phase 0)
│   │   ├── edition.model.ts           ← NEW (Phase 0)
│   │   └── organization.model.ts      ← NEW (Phase 1)
│   ├── services/api/
│   │   ├── tenant.service.ts          ← NEW (Phase 0)
│   │   ├── edition.service.ts         ← NEW (Phase 0)
│   │   └── organization.service.ts    ← NEW (Phase 1)
│   └── administration/components/
│       └── organization/              ← NEW FOLDER (Phase 2)
├── shared/components/
│   └── organization-tree/             ← NEW FOLDER (Phase 2)
└── utils/guard/
    └── host.guard.ts                  ← NEW (Phase 0)
```

---

## Phase 0: Host & Tenant Management

---

### 0.1 [NEW] `src/app/pages/models/api/tenant.model.ts`

**Purpose**: Define interfaces for tenant (customer) data

**Should Contain**:
| Interface | Fields | Description |
|-----------|--------|-------------|
| `Tenant` | id, tenancyName, name, editionId, isActive, subscriptionEndDate, maxUsers, userCount, createdAt | Customer account |
| `CreateTenantInput` | tenancyName, name, editionId, adminEmail, adminPassword | New tenant registration |
| `UpdateTenantInput` | id, name, editionId, isActive | Edit tenant |
| `GetAllTenantsResponse` | totalCount, items[] | Paginated list |
| `TenantResponse` | result: Tenant | Single tenant |

**Dependencies**: Extends [CommonModel](file:///d:/angular/src/app/shared/models/api/common.model.ts#1-8) from shared/models

---

### 0.2 [NEW] `src/app/pages/models/api/edition.model.ts`

**Purpose**: Define interfaces for subscription plans

**Should Contain**:
| Interface | Fields | Description |
|-----------|--------|-------------|
| `Edition` | id, name, displayName, monthlyPrice, yearlyPrice, maxUsers, maxOrganizationUnits, features[], isActive | Subscription plan |
| `CreateEditionInput` | name, displayName, prices, limits, features | New plan |
| `GetAllEditionsResponse` | items[] | All plans |

---

### 0.3 [NEW] `src/app/pages/services/api/tenant.service.ts`

**Purpose**: API calls for tenant management (Host-only)

**Should Contain**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| [getAll(input)](file:///d:/angular/src/app/pages/administration/components/user/user.component.ts#183-188) | GET Tenant/GetAll | List tenants with pagination |
| `getById(id)` | GET Tenant/Get | Single tenant details |
| [create(input)](file:///d:/angular/src/app/pages/administration/components/role/role.component.ts#172-175) | POST Tenant/Create | Create new tenant + admin user |
| [update(input)](file:///d:/angular/src/app/shared/services/permission.service.ts#217-227) | PUT Tenant/Update | Update tenant info |
| [delete(id)](file:///d:/angular/src/app/pages/administration/components/role/role.component.ts#184-203) | DELETE Tenant/Delete | Remove tenant |
| `activate(id)` | POST Tenant/Activate | Enable tenant |
| `deactivate(id)` | POST Tenant/Deactivate | Disable tenant |
| `impersonate(tenantId, userId)` | POST Account/Impersonate | Login as tenant user |

**Dependencies**: HttpClient, api_routes

---

### 0.4 [NEW] `src/app/pages/services/api/edition.service.ts`

**Purpose**: API calls for edition/plan management

**Should Contain**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| [getAll()](file:///d:/angular/src/app/pages/administration/components/user/user.component.ts#183-188) | GET Edition/GetAll | List all plans |
| [create(input)](file:///d:/angular/src/app/pages/administration/components/role/role.component.ts#172-175) | POST Edition/Create | Create plan |
| [update(input)](file:///d:/angular/src/app/shared/services/permission.service.ts#217-227) | PUT Edition/Update | Update plan |
| [delete(id)](file:///d:/angular/src/app/pages/administration/components/role/role.component.ts#184-203) | DELETE Edition/Delete | Remove plan |

---

### 0.5 [MODIFY] [src/app/utils/routes/api.route.ts](file:///d:/angular/src/app/utils/routes/api.route.ts)

**Purpose**: Add API endpoint constants

**Add These Constants**:
```
// Host - Tenant Management
getAllTenants, getTenantById, createTenant, updateTenant, deleteTenant
activateTenant, deactivateTenant, impersonate

// Host - Edition Management  
getAllEditions, createEdition, updateEdition, deleteEdition
```

---

### 0.6 [MODIFY] [src/app/utils/routes/local.route.ts](file:///d:/angular/src/app/utils/routes/local.route.ts)

**Purpose**: Add frontend route constants

**Add**:
```
HOST: 'host'
TENANTS: 'tenants'
EDITIONS: 'editions'
```

---

### 0.7 [NEW] `src/app/utils/guard/host.guard.ts`

**Purpose**: Protect Host pages from tenant users

**Should Contain**:
- Inject ConfigService to get current user context
- Check if `tenantId === null` (Host user)
- If yes → allow access
- If no → redirect to `/unauthorized`

---

### 0.8 [NEW] `src/app/pages/host/host.routes.ts`

**Purpose**: Define Host module routes

**Should Contain**:
| Path | Component | Description |
|------|-----------|-------------|
| `''` | Redirect to dashboard | Default |
| `dashboard` | HostDashboardComponent | Overview stats |
| `tenants` | TenantListComponent | Customer list |
| `editions` | EditionListComponent | Plan management |

---

### 0.9 [NEW] `src/app/pages/host/dashboard/host-dashboard.component.ts`

**Purpose**: Host admin overview page

**Should Contain**:
- **Stats Cards**: Total tenants, total users, active subscriptions, revenue
- **Recent Tenants Table**: Last 5 created tenants
- **Expiring Soon Alert**: Tenants with subscription ending in 30 days
- **Quick Actions**: Create tenant button

---

### 0.10 [NEW] `src/app/pages/host/tenants/tenant-list.component.ts`

**Purpose**: CRUD table for tenant management

**Should Contain**:
- **Data Table** (reuse SharedModule table): tenancyName, name, edition, userCount, status, actions
- **Filters**: Search, edition filter, status filter
- **Actions**: Edit, Activate/Deactivate, Delete, Impersonate
- **Create Button**: Opens tenant form dialog
- **Pagination**: Using existing table pagination

---

### 0.11 [NEW] `src/app/pages/host/tenants/tenant-form.component.ts`

**Purpose**: Create/Edit tenant dialog

**Should Contain**:
- **Form Fields**: tenancyName (slug), name (display), edition (dropdown), subscription dates
- **Admin Section** (create only): Admin email, admin password
- **Validation**: Required fields, unique tenancy name
- **Submit**: Calls create/update service

---

### 0.12 [NEW] `src/app/pages/host/editions/edition-list.component.ts`

**Purpose**: Subscription plan management

**Should Contain**:
- **Cards or Table**: name, price, user limit, OU limit, features
- **Actions**: Edit, Enable/Disable
- **Create Button**: Opens edition form

---

### 0.13 [MODIFY] [src/app.routes.ts](file:///d:/angular/src/app.routes.ts)

**Purpose**: Add Host route to main router

**Add**:
```typescript
{
  path: 'host',
  loadChildren: () => import('./app/pages/host/host.routes'),
  canActivate: [hostGuard]
}
```

---

## Phase 1: Organization Unit Core

---

### 1.1 [NEW] `src/app/pages/models/api/organization.model.ts`

**Purpose**: Define OU interfaces

**Should Contain**:
| Interface | Fields | Description |
|-----------|--------|-------------|
| `OrganizationUnit` | id, tenantId, parentId, code, displayName, level, path, memberCount, childCount, isActive | Single OU |
| `OrganizationUnitTree` | ...OrganizationUnit + children[] | Tree structure |
| `CreateOUInput` | parentId, displayName | New OU |
| `UpdateOUInput` | id, displayName | Edit OU |
| `MoveOUInput` | id, newParentId | Drag-drop |
| `GetAllOUsResponse` | totalCount, items[] | Flat list |
| `GetOUTreeResponse` | items[] with nested children | Tree |

---

### 1.2 [NEW] `src/app/pages/services/api/organization.service.ts`

**Purpose**: API calls for OU management

**Should Contain**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| [getAll(input)](file:///d:/angular/src/app/pages/administration/components/user/user.component.ts#183-188) | GET OrganizationUnit/GetAll | Flat list |
| `getTree(parentId?)` | GET OrganizationUnit/GetTree | Tree structure |
| [create(input)](file:///d:/angular/src/app/pages/administration/components/role/role.component.ts#172-175) | POST OrganizationUnit/Create | New OU |
| [update(input)](file:///d:/angular/src/app/shared/services/permission.service.ts#217-227) | PUT OrganizationUnit/Update | Edit |
| [delete(id)](file:///d:/angular/src/app/pages/administration/components/role/role.component.ts#184-203) | DELETE OrganizationUnit/Delete | Remove |
| `move(input)` | PUT OrganizationUnit/Move | Drag-drop |
| `getUsers(ouId)` | GET OrganizationUnit/GetUsers | Users in OU |
| `addUser(ouId, userId)` | POST OrganizationUnit/AddUser | Assign user |
| `removeUser(ouId, userId)` | DELETE OrganizationUnit/RemoveUser | Unassign |

---

### 1.3 [MODIFY] [src/app/utils/routes/api.route.ts](file:///d:/angular/src/app/utils/routes/api.route.ts)

**Add OU Routes**:
```
getAllOrganizationUnits, getOrganizationUnitTree
createOrganizationUnit, updateOrganizationUnit, deleteOrganizationUnit
moveOrganizationUnit, getOrganizationUnitUsers
assignUserToOrganizationUnit, removeUserFromOrganizationUnit
```

---

### 1.4 [MODIFY] [src/app/utils/routes/local.route.ts](file:///d:/angular/src/app/utils/routes/local.route.ts)

**Add**:
```
ORGANIZATION: 'organization'
```

---

## Phase 2: Organization UI Components

---

### 2.1 [NEW] `src/app/shared/components/organization-tree/organization-tree.component.ts`

**Purpose**: Reusable tree component for OU visualization

**Should Contain**:
- **Inputs**: `tree` (OrganizationUnitTree[]), `selectedNode`, `selectable`, `checkbox`
- **Outputs**: [onSelect](file:///d:/angular/src/app/shared/components/permission/permission.component.ts#83-87), `onDrop`, `onContextMenu`
- **Features**:
  - Uses PrimeNG Tree component
  - Displays user count badges
  - Expand/collapse nodes
  - Drag-and-drop support
  - Context menu integration

---

### 2.2 [NEW] `src/app/pages/administration/components/organization/organization.component.ts`

**Purpose**: Organization management page

**Should Contain**:
- **Left Panel**: Organization tree (using organization-tree component)
- **Right Panel**: Selected OU details (name, path, user count, actions)
- **Action Buttons**: Add Child, Edit, Delete, Assign Users
- **Create/Edit Dialog**: Simple form with displayName field
- **User Assignment Dialog**: List of users to add/remove

**Layout**:
```
┌─────────────────┬───────────────────────────────┐
│  TREE (40%)     │  DETAILS (60%)                │
│                 │  ┌─────────────────────────┐  │
│  📁 Root        │  │ Name: Sales Team        │  │
│  └─📁 Child     │  │ Path: Titan > Watches   │  │
│    └─📁 Leaf    │  │ Users: 45               │  │
│                 │  │ [Add Child] [Edit] [Del] │  │
│                 │  └─────────────────────────┘  │
└─────────────────┴───────────────────────────────┘
```

---

### 2.3 [MODIFY] [src/app/pages/administration/administration.routes.ts](file:///d:/angular/src/app/pages/administration/administration.routes.ts)

**Add**:
```typescript
{
  path: LOCAL_ROUTES.ORGANIZATION,
  loadComponent: () => import('./components/organization/organization.component')
    .then(m => m.OrganizationComponent)
}
```

---

### 2.4 [MODIFY] [src/app/shared/components/index.ts](file:///d:/angular/src/app/shared/components/index.ts)

**Export**: OrganizationTreeComponent

---

## Phase 3: User-OU Integration

---

### 3.1 [MODIFY] [src/app/pages/models/api/users.model.ts](file:///d:/angular/src/app/pages/models/api/users.model.ts)

**Add Fields to UsersModel**:
```
organizationUnitId?: number
organizationUnitName?: string
organizationUnitPath?: string  // For breadcrumb display
```

---

### 3.2 [MODIFY] [src/app/pages/administration/components/user/user.component.ts](file:///d:/angular/src/app/pages/administration/components/user/user.component.ts)

**Changes**:
- Add `organizationUnits` property to store OU list
- Call `organizationService.getTree()` on init
- Add OU tree-select to `formFields` array
- Add OU column to table columns

---

### 3.3 [MODIFY] [src/app/pages/administration/components/user/user.component.html](file:///d:/angular/src/app/pages/administration/components/user/user.component.html)

**Add**:
- Tree-select dropdown for organization unit
- Display OU breadcrumb in table

---

## Phase 4: Role-OU Scoping

---

### 4.1 [MODIFY] [src/app/pages/models/api/roles.model.ts](file:///d:/angular/src/app/pages/models/api/roles.model.ts)

**Add Fields to RolesModel**:
```
organizationUnitId?: number     // null = tenant-wide
organizationUnitName?: string
isInherited?: boolean           // From parent OU
```

---

### 4.2 [MODIFY] [src/app/pages/administration/components/role/role.component.ts](file:///d:/angular/src/app/pages/administration/components/role/role.component.ts)

**Changes**:
- Add OU selector (optional) - role can be scoped to OU
- Display "Tenant-wide" if no OU selected
- Add OU column to role table

---

## Summary: File Count by Phase

| Phase | New Files | Modified Files | Total |
|-------|-----------|----------------|-------|
| Phase 0 | 10 | 3 | 13 |
| Phase 1 | 2 | 2 | 4 |
| Phase 2 | 4 | 2 | 6 |
| Phase 3 | 0 | 3 | 3 |
| Phase 4 | 0 | 2 | 2 |
| **Total** | **16** | **12** | **28** |

---

## Exports to Update

After creating new files, update these index files:

1. [src/app/pages/models/api/index.ts](file:///d:/angular/src/app/pages/models/api/index.ts) - Export tenant, edition, organization models
2. [src/app/pages/services/api/index.ts](file:///d:/angular/src/app/pages/services/api/index.ts) - Export tenant, edition, organization services
3. [src/app/utils/guard/index.ts](file:///d:/angular/src/app/utils/guard/index.ts) - Export hostGuard
4. [src/app/shared/components/index.ts](file:///d:/angular/src/app/shared/components/index.ts) - Export organization-tree component

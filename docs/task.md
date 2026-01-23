# Implementation Task Checklist

## Phase 0: Host & Tenant Management

### 0.1 Models (New Files)
- [ ] `src/app/pages/models/api/tenant.model.ts`
- [ ] `src/app/pages/models/api/edition.model.ts`

### 0.2 Services (New Files)
- [ ] `src/app/pages/services/api/tenant.service.ts`
- [ ] `src/app/pages/services/api/edition.service.ts`

### 0.3 Routes (Modify)
- [ ] [src/app/utils/routes/api.route.ts](file:///d:/angular/src/app/utils/routes/api.route.ts) - Add tenant/edition API endpoints
- [ ] [src/app/utils/routes/local.route.ts](file:///d:/angular/src/app/utils/routes/local.route.ts) - Add HOST route constant

### 0.4 Guards (New File)
- [ ] `src/app/utils/guard/host.guard.ts`

### 0.5 Host Module (New Files)
- [ ] `src/app/pages/host/host.routes.ts`
- [ ] `src/app/pages/host/dashboard/host-dashboard.component.ts`
- [ ] `src/app/pages/host/tenants/tenant-list.component.ts`
- [ ] `src/app/pages/host/tenants/tenant-form.component.ts`
- [ ] `src/app/pages/host/editions/edition-list.component.ts`

### 0.6 App Routes (Modify)
- [ ] [src/app.routes.ts](file:///d:/angular/src/app.routes.ts) - Add host route

---

## Phase 1: Organization Unit Core

### 1.1 Models (New File)
- [ ] `src/app/pages/models/api/organization.model.ts`

### 1.2 Services (New File)
- [ ] `src/app/pages/services/api/organization.service.ts`

### 1.3 Routes (Modify)
- [ ] [src/app/utils/routes/api.route.ts](file:///d:/angular/src/app/utils/routes/api.route.ts) - Add OU API endpoints
- [ ] [src/app/utils/routes/local.route.ts](file:///d:/angular/src/app/utils/routes/local.route.ts) - Add ORGANIZATION constant

---

## Phase 2: Organization UI Components

### 2.1 Shared Tree Component (New Files)
- [ ] `src/app/shared/components/organization-tree/organization-tree.component.ts`
- [ ] `src/app/shared/components/organization-tree/organization-tree.component.html`
- [ ] `src/app/shared/components/organization-tree/organization-tree.component.scss`

### 2.2 Organization Page (New Files)
- [ ] `src/app/pages/administration/components/organization/organization.component.ts`
- [ ] `src/app/pages/administration/components/organization/organization.component.html`
- [ ] `src/app/pages/administration/components/organization/organization.component.scss`

### 2.3 Admin Routes (Modify)
- [ ] [src/app/pages/administration/administration.routes.ts](file:///d:/angular/src/app/pages/administration/administration.routes.ts) - Add organization route

---

## Phase 3: User-OU Integration

### 3.1 Models (Modify)
- [ ] [src/app/pages/models/api/users.model.ts](file:///d:/angular/src/app/pages/models/api/users.model.ts) - Add OU fields

### 3.2 User Component (Modify)
- [ ] [src/app/pages/administration/components/user/user.component.ts](file:///d:/angular/src/app/pages/administration/components/user/user.component.ts) - Add OU dropdown
- [ ] [src/app/pages/administration/components/user/user.component.html](file:///d:/angular/src/app/pages/administration/components/user/user.component.html) - Add OU field

---

## Phase 4: Role-OU Scoping

### 4.1 Models (Modify)
- [ ] [src/app/pages/models/api/roles.model.ts](file:///d:/angular/src/app/pages/models/api/roles.model.ts) - Add OU scoping fields

### 4.2 Role Component (Modify)
- [ ] [src/app/pages/administration/components/role/role.component.ts](file:///d:/angular/src/app/pages/administration/components/role/role.component.ts) - Add OU selector

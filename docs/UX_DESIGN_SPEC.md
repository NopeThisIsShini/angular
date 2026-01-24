# UX Design Specification: OU Scoping System

This document outlines the visual and functional requirements for the multi-perspective OU Scoping system.

---

## 1. User Management Perspective

### 1.1 Host Admin View
The Host Admin has a global perspective, seeing all tenants and all organization units.
- **Organization Tree:** Shows a massive, multi-tenant vertical tree.
- **Create User Dialog:** The 'Assign Organization Unit' dropdown lists the entire global hierarchy.

![Host Admin Management Perspective](host_admin_global_view_1769264613843.png)
![Host Admin Create User Dialog](create_user_dialog_host_view_1769264915286.png)

### 1.2 Tenant Admin View (e.g., Tata Group)
The Tenant Admin is scoped to their specific tenant. They see all children of their root unit but nothing outside or above it.
- **Organization Tree:** Rooted at 'Tata Group'.
- **Create User Dialog:** Only allows assigning users to Tata divisions (Titan, TCS, Motors).

![Tenant Admin Management Perspective](tata_group_admin_view_1769264644112.png)

### 1.3 Scoped Manager View (e.g., Titan Manager)
The Branch Manager is locked inside their specific division.
- **Organization Tree:** Simplified tree showing only 'Titan' and its sub-units.
- **Create User Dialog:** The dropdown is restricted to 'Titan', 'Watches', and 'Jewelry'.

![Scoped Manager View](titan_manager_scoped_view_1769264668492.png)
![Scoped Manager Create User Dialog](create_user_dialog_titan_view_1769264940813.png)

---

## 2. Role Management Design

Role management also respects scoping. A role created at a high level (e.g., 'Tata Group Admin') has broader implications but might be restricted from viewing 'Reliance' data. A role created at a branch level (e.g., 'Watches Lead') is physically bound to that branch's data scope.

### 2.1 Create Role Dialog
When creating a role, the admin must define its **Scope**.
- **Role Name:** e.g., "Branch Accountant"
- **Scope Selection:** Defines which OU this role operates inside.
- **Permissions:** A grid of checkboxes (Read, Write, Delete) for different system modules.

![Role Management Perspective](role_management_detail_view_1769264960170.png)

---

## 3. UI Behavior & Logic

### 3.1 Dropdown Filtering Logic
Every dropdown that allows selecting an Organization Unit must filter its options based on the `ouPath` of the logged-in user.

```typescript
// Logic for filtering dropdowns
const filteredOptions = allOUs.filter(ou => 
    ou.path.startsWith(currentUser.organizationUnitPath)
);
```

### 3.2 Sidebar Visibility
- **Tenants Menu:** Only visible if `user.role === 'Host'`.
- **Global Settings:** Only visible if `user.role === 'Host'`.
- **Local Administration:** Available for all levels, but data inside is filtered by scope.

### 3.3 Dashboard Cards
- Host Admin sees "Total System Revenue" (All Tenants).
- Tenant Admin sees "Tenant Revenue" (All Divisions).
- Branch Manager sees "Branch Revenue" (Only Local Units).

---

## 4. Key Takeaways for Developers

1.  **Don't build 3 separate apps.** Build 1 app that uses a `ScopeInterceptor` or a `ScopingDirective` to modify the UI based on the user's `ouPath`.
2.  **Breadcrumbs should respect scope.** A Titan Manager should never see 'Tata Group' in their breadcrumb path.
3.  **Search should be scoped.** Searching for "Finance" should only return results within the user's allowed branch.

---
*Created on: 2026-01-24*

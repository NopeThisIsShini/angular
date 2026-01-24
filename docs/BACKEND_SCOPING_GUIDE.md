# Backend OU Scoping - What Backend Must Provide

## TL;DR: Backend Does 90% of the Work

Backend is responsible for:
1. **Store** scope data (OU paths) in database
2. **Return** user's scope info on login/session
3. **Filter** ALL data queries by user's scope
4. **Validate** ALL mutations (create/edit/delete) by scope

---

## Database Schema (What Backend Stores)

### Organization Units Table
```sql
CREATE TABLE OrganizationUnits (
    Id INT PRIMARY KEY,
    ParentId INT NULL,
    DisplayName VARCHAR(255),
    Path VARCHAR(500),        -- Materialized path: '/1/2/5/'
    Level INT,
    TenantId INT
);

-- Example data:
-- | Id | ParentId | DisplayName      | Path      | Level |
-- |----|----------|------------------|-----------|-------|
-- | 1  | NULL     | Tata Group       | /1/       | 0     |
-- | 2  | 1        | Titan            | /1/2/     | 1     |
-- | 3  | 1        | Tata Motors      | /1/3/     | 1     |
-- | 5  | 2        | Watches Division | /1/2/5/   | 2     |
```

### Users Table
```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY,
    UserName VARCHAR(255),
    OrganizationUnitId INT,   -- FK to OrganizationUnits
    -- other fields...
);
```

---

## API 1: Login Response

**Endpoint:** `POST /api/auth/login`

**Response:**
```json
{
    "success": true,
    "result": {
        "accessToken": "eyJhbGc...",
        "userId": 2
    }
}
```

---

## API 2: Session/User Info (CRITICAL)

**Endpoint:** `GET /api/session/current`

**Response:**
```json
{
    "success": true,
    "result": {
        "user": {
            "id": 2,
            "userName": "titan_manager",
            "name": "Bhaskar",
            "surname": "Bhat",
            "emailAddress": "bhaskar@titan.com",
            "roleNames": ["Manager"],
            "organizationUnitId": 2,
            "organizationUnitPath": "/1/2/",
            "organizationUnitName": "Titan"
        },
        "permissions": [
            "dashboard.read",
            "user.read",
            "user.create",
            "user.edit",
            "user.delete"
        ],
        "tenant": {
            "id": 1,
            "name": "Tata Group"
        }
    }
}
```

**Frontend stores this and uses it for UI display.**

---

## API 3: Get Users (Scoped by Backend)

**Endpoint:** `GET /api/users`

**Backend Logic (C#/.NET Example):**
```csharp
public async Task<List<User>> GetUsers()
{
    var currentUser = await GetCurrentUser();
    var userOUPath = currentUser.OrganizationUnitPath;
    
    // Host admin (null path) sees everything
    if (string.IsNullOrEmpty(userOUPath))
    {
        return await _dbContext.Users.ToListAsync();
    }
    
    // Filter by scope: WHERE path LIKE '/1/2/%'
    return await _dbContext.Users
        .Include(u => u.OrganizationUnit)
        .Where(u => u.OrganizationUnit.Path.StartsWith(userOUPath))
        .ToListAsync();
}
```

**Backend Logic (Node.js Example):**
```javascript
async getUsers(req) {
    const currentUser = req.user;
    const userOUPath = currentUser.organizationUnitPath;
    
    // Host admin sees everything
    if (!userOUPath) {
        return await User.findAll();
    }
    
    // Filter by scope
    return await User.findAll({
        include: [{ model: OrganizationUnit }],
        where: {
            '$OrganizationUnit.path$': {
                [Op.like]: `${userOUPath}%`
            }
        }
    });
}
```

**Response (for Titan Manager `/1/2/`):**
```json
{
    "success": true,
    "result": {
        "totalCount": 8,
        "items": [
            {
                "id": 2,
                "fullName": "Bhaskar Bhat",
                "organizationUnitId": 2,
                "organizationUnitPath": "/1/2/",
                "organizationUnitName": "Titan"
            },
            {
                "id": 5,
                "fullName": "Suparna Mitra",
                "organizationUnitPath": "/1/2/5/",
                "organizationUnitName": "Watches Division"
            }
            // ... only Titan branch users
        ]
    }
}
```

**NOT returned (blocked by scope):**
- Ratan Tata (path: `/1/`) - parent, not in scope
- TCS users (path: `/1/4/`) - different branch
- Motors users (path: `/1/3/`) - different branch

---

## API 4: Edit User (Validate Scope)

**Endpoint:** `PUT /api/users/{id}`

**Backend Logic:**
```csharp
public async Task UpdateUser(int id, UpdateUserInput input)
{
    var currentUser = await GetCurrentUser();
    var targetUser = await _dbContext.Users
        .Include(u => u.OrganizationUnit)
        .FirstOrDefaultAsync(u => u.Id == id);
    
    // Check permission
    if (!currentUser.HasPermission("user.edit"))
    {
        throw new UnauthorizedException("No permission to edit users");
    }
    
    // Check scope
    if (!string.IsNullOrEmpty(currentUser.OrganizationUnitPath))
    {
        if (!targetUser.OrganizationUnit.Path.StartsWith(currentUser.OrganizationUnitPath))
        {
            throw new ForbiddenException("User is not in your scope");
        }
    }
    
    // Proceed with update...
}
```

---

## API 5: Delete User (Validate Scope)

Same pattern as edit - check permission AND scope before allowing delete.

---

## API 6: Get Organization Units (Scoped)

**Endpoint:** `GET /api/organization-units/tree`

**Backend Logic:**
```csharp
public async Task<List<OrganizationUnit>> GetTree()
{
    var currentUser = await GetCurrentUser();
    var userOUPath = currentUser.OrganizationUnitPath;
    
    if (string.IsNullOrEmpty(userOUPath))
    {
        return await GetFullTree(); // Host sees all
    }
    
    // Only return OUs in user's scope
    return await _dbContext.OrganizationUnits
        .Where(ou => ou.Path.StartsWith(userOUPath))
        .ToListAsync();
}
```

---

## Summary: What Backend Must Provide

### 1. Session API Must Return:
```json
{
    "organizationUnitId": 2,
    "organizationUnitPath": "/1/2/",
    "organizationUnitName": "Titan",
    "permissions": ["user.read", "user.edit", ...]
}
```

### 2. All Data APIs Must:
- Read the logged-in user's `organizationUnitPath`
- Filter queries: `WHERE path LIKE '{userPath}%'`
- Return only scoped data

### 3. All Mutation APIs Must:
- Check permission (can user do this action?)
- Check scope (is target in user's scope?)
- Reject if either fails

---

## The Golden Rule (Backend SQL)

```sql
-- For user with scope '/1/2/'
SELECT * FROM Users u
JOIN OrganizationUnits ou ON u.OrganizationUnitId = ou.Id
WHERE ou.Path LIKE '/1/2/%'

-- This returns:
-- /1/2/     ✅ (exact match)
-- /1/2/5/   ✅ (child)
-- /1/2/5/10/ ✅ (grandchild)
-- /1/3/     ❌ (different branch - NOT returned)
-- /1/       ❌ (parent - NOT returned)
```

---

## Security Checklist for Backend

| ✅ Backend MUST | ❌ Backend MUST NOT |
|----------------|-------------------|
| Store OU path in database | Trust frontend to filter data |
| Filter ALL queries by scope | Return unfiltered data |
| Validate scope on mutations | Allow edits outside scope |
| Return scope info in session | Rely on frontend for security |
| Log scope violations | Expose data to wrong users |

---

## API Contract Summary

| API | Method | Scoped? | Returns |
|-----|--------|---------|---------|
| `/api/session` | GET | - | User with `organizationUnitPath` |
| `/api/users` | GET | ✅ Yes | Only users in scope |
| `/api/users/{id}` | PUT | ✅ Validated | 403 if out of scope |
| `/api/users/{id}` | DELETE | ✅ Validated | 403 if out of scope |
| `/api/organization-units/tree` | GET | ✅ Yes | Only OUs in scope |
| `/api/roles` | GET | Usually not scoped | All roles |

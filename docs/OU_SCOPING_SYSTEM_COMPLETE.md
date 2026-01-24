# OU Scoping System - Real Implementation Guide

## Quick Start: 3 Demo Logins

Go to the login page (`/auth/login`) and you'll see **3 quick login options**:

| User | Role | OU Path | What They Can See |
|------|------|---------|-------------------|
| **Host Admin** | Host | `null` | ✅ ALL users (no OU restrictions) |
| **Ratan Tata** | Tenant Admin | `/1/` | ✅ All Tata Group users (12 users) |
| **Bhaskar Bhat** | Manager | `/1/2/` | ✅ Only Titan branch (8 users) |

---

## How It Works

### 1. Login Flow

```
Login Page → Click Quick Login Card → Stores profile in localStorage
                                    → AuthService loads login.json
                                    → ConfigService loads correct session-{profile}.json
                                    → OUScopingService initialized with user context
```

### 2. Session Files

| File | User | OU Path |
|------|------|---------|
| `session-host.json` | Host Admin | `null` (no restrictions) |
| `session-tata-group.json` | Ratan Tata | `/1/` |
| `session-titan.json` | Bhaskar Bhat | `/1/2/` |

### 3. The Golden Rule

```typescript
// In OUScopingService
hasAccess = targetPath.startsWith(userPath)

// Special case: null userPath = Host Admin = access to EVERYTHING
if (!userPath) return true; // Host admin
```

---

## What You'll See

### As **Host Admin** (null path):
- **12 users** visible
- Banner shows: "🌐 Host Admin - No OU Restrictions"

### As **Ratan Tata** (`/1/`):
- **12 users** visible (all under Tata Group)
- Banner shows: "Tata Group (/1/)"

### As **Bhaskar Bhat** (`/1/2/`):
- **8 users** visible:
  - Bhaskar Bhat (himself)
  - Suparna Mitra (Watches Division)
  - Aishwarya Singh (Jewelry Division)
  - Vikram Sharma (Sales Team)
  - Priya Patel (Sales Team)
  - Neha Gupta (Marketing Team)
  - Rahul Verma (Marketing Team)
  - Kavita Joshi (Jewelry Division)
- **NOT visible**: TCS users, Tata Motors users, Ratan Tata
- Banner shows: "Titan (/1/2/)"

---

## Organization Hierarchy

```
Tata Group (id=1, path=/1/)
├── Titan (id=2, path=/1/2/)         → Bhaskar can see this branch
│   ├── Watches Division (id=5, path=/1/2/5/)
│   │   ├── Sales Team (id=10)
│   │   └── Marketing Team (id=11)
│   └── Jewelry Division (id=6, path=/1/2/6/)
├── Tata Motors (id=3, path=/1/3/)   → Bhaskar CANNOT see
└── TCS (id=4, path=/1/4/)           → Bhaskar CANNOT see
```

---

## Files Modified

| File | Change |
|------|--------|
| `login.component.ts/html` | Added 3 quick login cards |
| `auth.service.ts` | Stores `demoSessionProfile` in localStorage |
| `config.service.ts` | Loads correct session file based on profile |
| `ou-scoping.service.ts` | Handles null paths for Host admin |
| `users.service.ts` | Applies OU filtering using `filterByPath()` |
| `user.component.ts/html` | Shows scope banner and OU column |
| `session-*.json` | 3 session files for each login profile |
| `users.json` | 12 users with `organizationUnitPath` |

---

## Console Logs

Open browser DevTools and you'll see:

```
[ConfigService] Loading session from: assets/db/session-titan.json
[ConfigService] OU Scope initialized: /1/2/
[OUScoping] User scope set: titan_manager @ /1/2/
[UsersService] Current user scope: /1/2/
[UsersService] Total users before filtering: 12
[UsersService] Users after OU scoping: 8
```

---

## Test It!

1. Go to `http://localhost:4200/auth/login`
2. Click on any quick login card
3. Navigate to **Administration → Users**
4. See the filtered user list
5. Logout and try a different profile

---

*Last Updated: 2026-01-24*

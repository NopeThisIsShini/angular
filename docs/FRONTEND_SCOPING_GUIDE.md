# Frontend OU Scoping - What You Actually Need To Do

## TL;DR: Frontend Does Very Little

Frontend's job is **simple**: 
1. **Store** the scope info that backend sends
2. **Display** what backend returns (already filtered)
3. **Hide** UI elements for better UX (optional polish)

---

## What Backend Sends You (On Login/Session)

```json
{
  "user": {
    "id": 2,
    "userName": "titan_manager",
    "roleNames": ["Manager"],
    "permissions": ["user.read", "user.edit", "user.delete"],
    "organizationUnitId": 2,
    "organizationUnitPath": "/1/2/",
    "organizationUnitName": "Titan"
  }
}
```

---

## Frontend Step-by-Step (The Minimal Approach)

### Step 1: Store Session Data (REQUIRED)

```typescript
// After login, store the user context
@Injectable({ providedIn: 'root' })
export class SessionService {
    private currentUser: UserContext | null = null;
    
    setUser(user: UserContext): void {
        this.currentUser = user;
    }
    
    getUser(): UserContext | null {
        return this.currentUser;
    }
    
    getUserOUPath(): string | null {
        return this.currentUser?.organizationUnitPath || null;
    }
}
```

### Step 2: Call APIs (REQUIRED)

```typescript
// Just call the API - backend returns filtered data
getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
    // Backend automatically returns only scoped users
    // Frontend does NOT filter!
}
```

### Step 3: Display Data (REQUIRED)

```html
<!-- Just display what backend sent - it's already filtered -->
<table>
    <tr *ngFor="let user of users">
        <td>{{ user.fullName }}</td>
        <td>{{ user.organizationUnitName }}</td>
    </tr>
</table>
```

### Step 4: Hide Buttons (OPTIONAL - UX Polish)

```html
<!-- Option A: Use permission directive (most common) -->
<button *appHasPermission="'user.edit'">Edit</button>

<!-- Option B: Use scope directive (if you want path-level hiding) -->
<button *appIfScope="user.organizationUnitPath">Edit</button>

<!-- Option C: Both together -->
<button *appHasPermission="'user.edit'" *appIfScope="user.organizationUnitPath">
    Edit
</button>
```

---

## What You DON'T Do In Frontend

| ❌ DON'T | Why |
|----------|-----|
| Filter data by scope | Backend already filtered it |
| Block API calls | Backend will reject unauthorized requests |
| Validate scope paths | Backend validates everything |
| Store scope rules | Backend decides who sees what |

---

## The Only Frontend Code You Actually Need

### Minimal Service (Store user context):

```typescript
@Injectable({ providedIn: 'root' })
export class SessionService {
    private user$ = new BehaviorSubject<UserContext | null>(null);
    
    setUser(user: UserContext): void {
        this.user$.next(user);
    }
    
    getUser(): UserContext | null {
        return this.user$.getValue();
    }
    
    hasPermission(key: string): boolean {
        return this.getUser()?.permissions?.includes(key) ?? false;
    }
    
    // Optional: Only if you want to hide UI elements by scope
    canAccessPath(targetPath: string): boolean {
        const userPath = this.getUser()?.organizationUnitPath;
        if (!userPath) return true; // Host admin
        return targetPath?.startsWith(userPath) ?? false;
    }
}
```

### Minimal Directive (Hide elements):

```typescript
@Directive({ selector: '[appHasPermission]', standalone: false })
export class HasPermissionDirective {
    @Input() set appHasPermission(key: string) {
        if (this.sessionService.hasPermission(key)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
```

---

## Summary: Frontend Work = 10%

| Task | Effort | Required? |
|------|--------|-----------|
| Store session/user context | 5 min | ✅ Yes |
| Call APIs normally | 0 min (same as before) | ✅ Yes |
| Display returned data | 0 min (same as before) | ✅ Yes |
| Permission directive | 10 min | Optional (nice UX) |
| Scope directive | 10 min | Optional (nice UX) |

**Total new frontend code: ~50 lines**

---

## When To Use Scope Directives

| Scenario | Use Permission Directive | Use Scope Directive |
|----------|-------------------------|---------------------|
| Hide menu items | ✅ Yes | ❌ No |
| Hide Add/Create buttons | ✅ Yes | ❌ No |
| Hide Edit button on specific row | ✅ Yes | ⚠️ Maybe (if permissions differ per OU) |
| Show "out of scope" indicator | ❌ No | ✅ Yes |

---

## Real Example: User List Page

```typescript
@Component({...})
export class UserListComponent implements OnInit {
    users: User[] = [];
    
    constructor(
        private userService: UserService,
        private sessionService: SessionService
    ) {}
    
    ngOnInit() {
        // Just call the API - backend handles scoping
        this.userService.getUsers().subscribe(users => {
            this.users = users; // Already filtered by backend!
        });
    }
}
```

```html
<p-table [value]="users">
    <ng-template pTemplate="body" let-user>
        <tr>
            <td>{{ user.fullName }}</td>
            <td>{{ user.organizationUnitName }}</td>
            <td>
                <!-- Permission-based button hiding -->
                <button *appHasPermission="'user.edit'">Edit</button>
                <button *appHasPermission="'user.delete'">Delete</button>
            </td>
        </tr>
    </ng-template>
</p-table>
```

That's it! **Backend does the heavy lifting.**

import { Injectable, inject } from '@angular/core';
import { SignalStore } from '@/app/store/signal-store';
import { CallState, callState, getErrorMessage } from '@/app/store/store-utils';
import { UsersModel, RolesModel } from '@/app/pages/models';
import { UsersService } from '@/app/pages/services';
import { finalize } from 'rxjs/operators';

interface UserState {
    users: UsersModel[];
    totalCount: number;
    roles: RolesModel[];
    loadStatus: CallState;
    rolesStatus: CallState;
    operationStatus: {
        status: 'idle' | 'executing' | 'success' | 'error';
        message?: string;
        action?: 'create' | 'edit' | 'delete';
    };
}

@Injectable({
    providedIn: 'root',
})
export class UserStore extends SignalStore<UserState> {
    private userService = inject(UsersService);

    readonly users = this.select(s => s.users);
    readonly totalCount = this.select(s => s.totalCount);
    readonly roles = this.select(s => s.roles);
    readonly isLoading = this.select(s => s.loadStatus === 'loading');
    readonly operationStatus = this.select(s => s.operationStatus);

    constructor() {
        super({
            users: [],
            totalCount: 0,
            roles: [],
            loadStatus: callState(),
            rolesStatus: callState(),
            operationStatus: { status: 'idle' }
        });
    }

    loadUsers(params: { keyword?: string; skipCount?: number; maxResultCount?: number }) {
        this.patchState({ loadStatus: 'loading' });
        this.userService.getallusers(params).subscribe({
            next: (res) => {
                this.patchState({
                    users: res.result.items,
                    totalCount: res.result.totalCount,
                    loadStatus: 'loaded'
                });
            },
            error: (err) => {
                this.patchState({ loadStatus: { error: getErrorMessage(err) } });
            }
        });
    }

    loadRoles() {
        if (this.state().roles.length > 0) return;
        
        this.patchState({ rolesStatus: 'loading' });
        this.userService.getRoles().subscribe({
            next: (res) => {
                this.patchState({ 
                    roles: res.result.items,
                    rolesStatus: 'loaded'
                });
            },
            error: (err) => {
                this.patchState({ rolesStatus: { error: getErrorMessage(err) } });
            }
        });
    }

    saveUser(user: UsersModel, isEdit: boolean) {
        const action = isEdit ? 'edit' : 'create';
        this.patchState({ operationStatus: { status: 'executing', action } });
        
        this.userService.saveUser(user, isEdit)
            .pipe(finalize(() => {}))
            .subscribe({
                next: () => {
                    this.patchState({ 
                        operationStatus: { 
                            status: 'success', 
                            action,
                            message: isEdit ? 'User updated successfully' : 'User created successfully'
                        } 
                    });
                    // Refresh current list after save
                    this.loadUsers({ skipCount: 0, maxResultCount: 10 });
                },
                error: (err) => {
                    this.patchState({ 
                        operationStatus: { 
                            status: 'error', 
                            action,
                            message: getErrorMessage(err) 
                        } 
                    });
                }
            });
    }

    deleteUser(id: number, userEmail: string) {
        this.patchState({ operationStatus: { status: 'executing', action: 'delete' } });
        
        this.userService.deleteUser(id).subscribe({
            next: () => {
                this.patchState({ 
                    operationStatus: { 
                        status: 'success', 
                        action: 'delete',
                        message: `User ${userEmail} deleted successfully`
                    } 
                });
                this.loadUsers({ skipCount: 0, maxResultCount: 10 });
            },
            error: (err) => {
                this.patchState({ 
                    operationStatus: { 
                        status: 'error', 
                        action: 'delete',
                        message: getErrorMessage(err)
                    } 
                });
            }
        });
    }

    resetOperationStatus() {
        this.patchState({ operationStatus: { status: 'idle' } });
    }
}

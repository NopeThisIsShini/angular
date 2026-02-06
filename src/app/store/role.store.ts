import { Injectable, inject } from '@angular/core';
import { SignalStore } from '@/app/store/signal-store';
import { CallState, callState, getErrorMessage } from '@/app/store/store-utils';
import { RolesModel } from '@/app/pages/models';
import { RoleService } from '@/app/pages/services';

interface RoleState {
    roles: RolesModel[];
    totalCount: number;
    loadStatus: CallState;
    operationStatus: {
        status: 'idle' | 'executing' | 'success' | 'error';
        message?: string;
        action?: 'create' | 'edit' | 'delete';
    };
}

@Injectable({
    providedIn: 'root',
})
export class RoleStore extends SignalStore<RoleState> {
    private roleService = inject(RoleService);

    readonly roles = this.select(s => s.roles);
    readonly totalCount = this.select(s => s.totalCount);
    readonly isLoading = this.select(s => s.loadStatus === 'loading');
    readonly operationStatus = this.select(s => s.operationStatus);

    constructor() {
        super({
            roles: [],
            totalCount: 0,
            loadStatus: callState(),
            operationStatus: { status: 'idle' }
        });
    }

    loadRoles(params: { keyword?: string; skipCount?: number; maxResultCount?: number }) {
        this.patchState({ loadStatus: 'loading' });
        this.roleService.getallRoles(params).subscribe({
            next: (res) => {
                this.patchState({
                    roles: res.result.items,
                    totalCount: res.result.totalCount,
                    loadStatus: 'loaded'
                });
            },
            error: (err) => {
                this.patchState({ loadStatus: { error: getErrorMessage(err) } });
            }
        });
    }

    saveRole(role: RolesModel, isEdit: boolean) {
        const action = isEdit ? 'edit' : 'create';
        this.patchState({ operationStatus: { status: 'executing', action } });
        
        this.roleService.saveRole(role, isEdit).subscribe({
            next: () => {
                this.patchState({ 
                    operationStatus: { 
                        status: 'success', 
                        action,
                        message: isEdit ? 'Role updated successfully' : 'Role created successfully'
                    } 
                });
                this.loadRoles({ skipCount: 0, maxResultCount: 10 });
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

    deleteRole(id: number, roleName: string) {
        this.patchState({ operationStatus: { status: 'executing', action: 'delete' } });
        
        this.roleService.deleteRoleByid(id).subscribe({
            next: () => {
                this.patchState({ 
                    operationStatus: { 
                        status: 'success', 
                        action: 'delete',
                        message: `Role ${roleName} deleted successfully`
                    } 
                });
                this.loadRoles({ skipCount: 0, maxResultCount: 10 });
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

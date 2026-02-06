import { Injectable, inject } from '@angular/core';
import { SignalStore } from '@/app/store/signal-store';
import { CallState, callState, getErrorMessage } from '@/app/store/store-utils';
import { TenantModel } from '@/app/pages/models';
import { TenantService } from '@/app/pages/services';

interface TenantState {
    tenants: TenantModel[];
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
export class TenantStore extends SignalStore<TenantState> {
    private tenantService = inject(TenantService);

    readonly tenants = this.select(s => s.tenants);
    readonly totalCount = this.select(s => s.totalCount);
    readonly isLoading = this.select(s => s.loadStatus === 'loading');
    readonly operationStatus = this.select(s => s.operationStatus);

    constructor() {
        super({
            tenants: [],
            totalCount: 0,
            loadStatus: callState(),
            operationStatus: { status: 'idle' }
        });
    }

    loadTenants(params: { keyword?: string; skipCount?: number; maxResultCount?: number }) {
        this.patchState({ loadStatus: 'loading' });
        this.tenantService.getAllTenants(params).subscribe({
            next: (res) => {
                this.patchState({
                    tenants: res.result.items,
                    totalCount: res.result.totalCount,
                    loadStatus: 'loaded'
                });
            },
            error: (err) => {
                this.patchState({ loadStatus: { error: getErrorMessage(err) } });
            }
        });
    }

    saveTenant(tenant: any, isEdit: boolean) {
        const action = isEdit ? 'edit' : 'create';
        this.patchState({ operationStatus: { status: 'executing', action } });
        
        this.tenantService.saveTenant(tenant, isEdit).subscribe({
            next: () => {
                this.patchState({ 
                    operationStatus: { 
                        status: 'success', 
                        action,
                        message: isEdit ? 'Tenant updated successfully' : 'Tenant created successfully'
                    } 
                });
                this.loadTenants({ skipCount: 0, maxResultCount: 10 });
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

    deleteTenant(id: number, tenantName: string) {
        this.patchState({ operationStatus: { status: 'executing', action: 'delete' } });
        
        this.tenantService.deleteTenant(id).subscribe({
            next: () => {
                this.patchState({ 
                    operationStatus: { 
                        status: 'success', 
                        action: 'delete',
                        message: `Tenant ${tenantName} deleted successfully`
                    } 
                });
                this.loadTenants({ skipCount: 0, maxResultCount: 10 });
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

import { Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@/app/shared/shared.imports';
import { ColumnDef, FormField, TableAction } from '@/app/shared/models';
import { TenantModel, CreateTenantInput, UpdateTenantInput } from '@/app/pages/models';
import { validationConstants } from '@/app/utils/constant';
import { TenantStore } from '@/app/store';

@Component({
    selector: 'app-tenants',
    imports: [SharedModule],
    templateUrl: './tenants.component.html',
    styleUrl: './tenants.component.scss'
})
export class TenantsComponent {
    private store = inject(TenantStore);
    private messageService = inject(MessageService);
    private authConfirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    // State from store
    tenants = this.store.tenants;
    totalCount = this.store.totalCount;
    loading = this.store.isLoading;
    operationStatus = this.store.operationStatus;
    isSaving = computed(() => this.operationStatus().status === 'executing');

    showCreateEditDialog = signal<boolean>(false);
    editMode = signal<boolean>(false);
    selectedTenant: TenantModel | null = null;

    form = this.fb.group({
        id: [0],
        tenantName: ['', [Validators.required]],
        tenantSlug: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
        email: ['', [Validators.required, Validators.pattern(validationConstants.EMAIL_PATTERN)]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        password: [''],
        status: ['active']
    });

    columns: ColumnDef[] = [
        { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text' },
        { field: 'slug', header: 'Slug', sortable: true, filterable: true, filterType: 'text' },
        { field: 'status', header: 'Status', sortable: true },
        { field: 'createdAt', header: 'Created At', sortable: true }
    ];

    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: (data: TenantModel) => this.openUpdateDialog(data)
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            outlined: true,
            severity: 'danger',
            command: (data: TenantModel) => this.confirmDelete(data)
        }
    ];

    constructor() {
        // Reactively handle operation results
        effect(() => {
            const op = this.operationStatus();
            if (op.status === 'success') {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: op.message
                });

                if (op.action === 'create' || op.action === 'edit') {
                    this.hideDialog();
                }

                untracked(() => this.store.resetOperationStatus());
            } else if (op.status === 'error') {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: op.message
                });
                untracked(() => this.store.resetOperationStatus());
            }
        });
    }

    getAllTenants(event: TableLazyLoadEvent): void {
        this.store.loadTenants({
            keyword: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
            skipCount: event.first ?? 0,
            maxResultCount: event.rows ?? 10
        });
    }

    openCreateDialog(): void {
        this.editMode.set(false);
        this.form.reset({ id: 0, status: 'active' });
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.showCreateEditDialog.set(true);
    }

    openUpdateDialog(tenant: TenantModel): void {
        this.editMode.set(true);
        this.selectedTenant = tenant;
        this.form.patchValue({
            id: tenant.id,
            tenantName: tenant.name,
            tenantSlug: tenant.slug,
            status: tenant.status
        });
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.showCreateEditDialog.set(true);
    }

    hideDialog(): void {
        this.showCreateEditDialog.set(false);
        this.form.reset({ id: 0, status: 'active' });
        this.selectedTenant = null;
    }

    saveTenant(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            return;
        }

        const data = this.form.getRawValue();
        this.store.saveTenant(data as any, this.editMode());
    }

    confirmDelete(tenant: TenantModel): void {
        this.authConfirmationService.confirm({
            message: `Are you sure you want to delete "${tenant.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.store.deleteTenant(tenant.id, tenant.name);
            }
        });
    }

    isFieldInvalid(fieldKey: string): boolean {
        const field = this.form.get(fieldKey);
        return !!(field?.invalid && (field?.dirty || field?.touched));
    }

    getFieldErrors(fieldKey: string): string[] {
        const field = this.form.get(fieldKey);
        const errors: string[] = [];
        if (field?.errors && this.isFieldInvalid(fieldKey)) {
            if (field.errors['required']) errors.push('This field is required.');
            if (field.errors['pattern']) errors.push('Invalid format.');
            if (field.errors['minlength']) errors.push('Minimum 6 characters required.');
        }
        return errors;
    }
}

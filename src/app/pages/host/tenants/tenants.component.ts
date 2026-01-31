import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@app/shared/shared.imports';
import { ColumnDef, TableAction } from '@app/shared/models';
import { TenantModel } from '@app/pages/models';
import { TenantService } from '@app/pages/services/api';
import { validationConstants } from '@app/utils/constant';

@Component({
    selector: 'app-tenants',
    imports: [SharedModule],
    templateUrl: './tenants.component.html',
    styleUrl: './tenants.component.scss'
})
export class TenantsComponent implements OnInit {
    tenantsData: TenantModel[] = [];
    totalCount: number = 0;
    loading: boolean = true;
    showCreateEditDialog: boolean = false;
    editMode: boolean = false;
    form!: FormGroup;
    selectedTenant: TenantModel | null = null;

    columns: ColumnDef[] = [
        { field: 'name', header: 'Tenant Name', sortable: true, filterable: true, filterType: 'text' },
        { field: 'slug', header: 'Slug', sortable: true, filterable: true, filterType: 'text' },
        { field: 'status', header: 'Status', template: undefined },
        { field: 'createdAt', header: 'Created At', sortable: true }
    ];

    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: (data: TenantModel) => {
                this.openUpdateDialog(data);
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            outlined: true,
            severity: 'danger',
            command: (data: TenantModel) => {
                this.confirmDelete(data);
            }
        }
    ];

    constructor(
        private tenantService: TenantService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            id: [0],
            tenantName: ['', [Validators.required]],
            tenantSlug: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
            email: ['', [Validators.required, Validators.email]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            password: [''],
            status: ['active']
        });
    }

    getAllTenants(event: TableLazyLoadEvent): void {
        this.loading = true;
        this.tenantService
            .getAllTenants({
                keyword: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
                skipCount: event.first ?? 0,
                maxResultCount: event.rows ?? 10
            })
            .subscribe({
                next: (res) => {
                    this.tenantsData = res.result.items;
                    this.totalCount = res.result.totalCount;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load tenants'
                    });
                }
            });
    }

    openCreateDialog(): void {
        this.editMode = false;
        this.form.reset({ id: 0, status: 'active' });
        this.form.get('password')?.setValidators([Validators.required]);
        this.showCreateEditDialog = true;
    }

    openUpdateDialog(tenant: TenantModel): void {
        this.editMode = true;
        this.selectedTenant = tenant;
        this.form.get('password')?.clearValidators();
        this.form.patchValue({
            id: tenant.id,
            tenantName: tenant.name,
            tenantSlug: tenant.slug,
            status: tenant.status
            // Note: email, firstName, etc might not be available in listing,
            // you might need to fetch detailed info if needed
        });
        this.showCreateEditDialog = true;
    }

    hideDialog(): void {
        this.showCreateEditDialog = false;
        this.form.reset({ id: 0, status: 'active' });
        this.selectedTenant = null;
    }

    saveTenant(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        const payload = { ...this.form.value };
        if (this.editMode) {
            delete payload.password; // Don't send empty password on update if not changed
        }

        this.tenantService.saveTenant(payload, this.editMode).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: this.editMode ? 'Tenant updated successfully' : 'Tenant created successfully'
                });
                this.getAllTenants({ first: 0, rows: 10 });
                this.hideDialog();
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.editMode ? 'Failed to update tenant' : 'Failed to create tenant'
                });
            }
        });
    }

    confirmDelete(tenant: TenantModel): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${tenant.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                variant: 'text'
            },
            acceptButtonProps: {
                severity: 'danger',
                label: 'Yes, Delete'
            },
            accept: () => {
                this.deleteTenant(tenant.id);
            }
        });
    }

    deleteTenant(id: number): void {
        this.loading = true;
        this.tenantService.deleteTenant(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Tenant deleted successfully'
                });
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete tenant'
                });
            },
            complete: () => {
                this.getAllTenants({ first: 0, rows: 10 });
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
            if (field.errors['email']) errors.push('Invalid email address.');
            if (field.errors['pattern']) errors.push('Invalid format.');
        }

        return errors;
    }
}

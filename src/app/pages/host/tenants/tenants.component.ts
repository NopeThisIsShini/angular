import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@app/shared/shared.imports';
import { ColumnDef, TableAction } from '@app/shared/models';
import { TenantModel, EditionModel } from '@app/pages/models';
import { TenantService, EditionService } from '@app/pages/services/api';
import { validationConstants } from '@app/utils/constant';

@Component({
    selector: 'app-tenants',
    imports: [SharedModule],
    templateUrl: './tenants.component.html',
    styleUrl: './tenants.component.scss'
})
export class TenantsComponent implements OnInit {
    tenantsData: TenantModel[] = [];
    editions: { label: string; value: any }[] = [];
    totalCount: number = 0;
    loading: boolean = true;
    showCreateEditDialog: boolean = false;
    editMode: boolean = false;
    form!: FormGroup;
    selectedTenant: TenantModel | null = null;

    columns: ColumnDef[] = [
        { field: 'tenancyName', header: 'Tenancy Name', sortable: true, filterable: true, filterType: 'text' },
        { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text' },
        { field: 'editionDisplayName', header: 'Edition', sortable: true },
        { field: 'isActive', header: 'Active', template: undefined }, // Will use template in HTML
        { field: 'subscriptionEndDateUtc', header: 'Sub. End Date', sortable: true }
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
        private editionService: EditionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.initializeForm();
        this.loadEditions();
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            id: [0],
            tenancyName: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
            name: ['', [Validators.required]],
            adminEmailAddress: ['', [Validators.required, Validators.email]],
            adminPassword: [''],
            editionId: [null],
            isActive: [true],
            isInTrialPeriod: [false],
            subscriptionEndDateUtc: [null],
            connectionString: [null]
        });
    }

    private loadEditions(): void {
        this.editionService.getAllEditions({ MaxResultCount: 1000 }).subscribe({
            next: (res) => {
                this.editions = res.result.items.map((e: EditionModel) => ({
                    label: e.displayName,
                    value: e.id
                }));
            }
        });
    }

    getAllTenants(event: TableLazyLoadEvent): void {
        this.loading = true;
        this.tenantService
            .getAllTenants({
                SearchTerm: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
                SkipCount: event.first ?? 0,
                MaxResultCount: event.rows ?? 10
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
        this.form.reset({ id: 0, isActive: true, isInTrialPeriod: false });
        this.form.get('adminPassword')?.setValidators([Validators.required]);
        this.showCreateEditDialog = true;
    }

    openUpdateDialog(tenant: TenantModel): void {
        this.editMode = true;
        this.selectedTenant = tenant;
        this.form.get('adminPassword')?.clearValidators();
        this.form.patchValue({
            id: tenant.id,
            tenancyName: tenant.tenancyName,
            name: tenant.name,
            adminEmailAddress: tenant.adminEmailAddress,
            editionId: tenant.editionId,
            isActive: tenant.isActive,
            isInTrialPeriod: tenant.isInTrialPeriod,
            subscriptionEndDateUtc: tenant.subscriptionEndDateUtc ? new Date(tenant.subscriptionEndDateUtc) : null,
            connectionString: tenant.connectionString
        });
        this.showCreateEditDialog = true;
    }

    hideDialog(): void {
        this.showCreateEditDialog = false;
        this.form.reset({ id: 0, isActive: true, isInTrialPeriod: false });
        this.selectedTenant = null;
    }

    saveTenant(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.tenantService.saveTenant(this.form.value, this.editMode).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: this.editMode ? 'Tenant updated successfully' : 'Tenant created successfully'
                });
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.editMode ? 'Failed to update tenant' : 'Failed to create tenant'
                });
            },
            complete: () => {
                this.getAllTenants({ first: 0, rows: 10 });
                this.hideDialog();
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

    formatDate(date: string | null): string {
        if (!date) return 'Unlimited';
        return new Date(date).toLocaleDateString();
    }
}

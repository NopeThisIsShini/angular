import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@app/shared/shared.imports';
import { ColumnDef, FormField, TableAction } from '@app/shared/models';
import { TenantService, EditionService } from '@app/pages/services/api';
import { Tenant, Edition } from '@app/pages/models';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss'
})
export class TenantsComponent implements OnInit {
    private tenantService = inject(TenantService);
    private editionService = inject(EditionService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    tenants: Tenant[] = [];
    editions: Edition[] = [];
    totalCount = 0;
    loading = true;
    dialogVisible = false;
    editMode = false;
    form!: FormGroup;

    columns: ColumnDef[] = [
        { field: 'name', header: 'Name' },
        { field: 'tenancyName', header: 'Tenancy Name' },
        { field: 'editionName', header: 'Edition' },
        { field: 'userCount', header: 'Users' },
        { field: 'subscriptionEndDate', header: 'Subscription End' },
        { field: 'isActive', header: 'Status' }
    ];

    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: (data: Tenant) => this.editTenant(data)
        },
        {
            label: 'Impersonate',
            icon: 'pi pi-user',
            severity: 'info',
            command: (data: Tenant) => this.impersonate(data)
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            severity: 'danger',
            outlined: true,
            command: (data: Tenant) => this.deleteTenant(data)
        }
    ];

    formFields: FormField[] = [
        {
            key: 'tenancyName',
            label: 'Tenancy Name (Slug)',
            type: 'text',
            mark: true,
            validators: [Validators.required],
            errorMessages: { required: 'Tenancy name is required.' }
        },
        {
            key: 'name',
            label: 'Display Name',
            type: 'text',
            mark: true,
            validators: [Validators.required],
            errorMessages: { required: 'Name is required.' }
        },
        {
            key: 'editionId',
            label: 'Edition',
            type: 'select',
            mark: true,
            validators: [Validators.required],
            errorMessages: { required: 'Edition is required.' }
        }
    ];

    ngOnInit(): void {
        this.initializeForm();
        this.loadEditions();
    }

    initializeForm() {
        this.form = this.fb.group({
            id: [0],
            tenancyName: ['', Validators.required],
            name: ['', Validators.required],
            editionId: [null, Validators.required],
            isActive: [true]
        });
    }

    loadTenants(event: TableLazyLoadEvent): void {
        this.loading = true;
        this.tenantService.getAll({
            SearchTerm: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
            SkipCount: event.first ?? 0,
            MaxResultCount: event.rows ?? 10
        }).subscribe({
            next: (res) => {
                this.tenants = res.result.items;
                this.totalCount = res.result.totalCount;
            },
            complete: () => this.loading = false
        });
    }

    loadEditions(): void {
        this.editionService.getAll().subscribe({
            next: (res) => {
                this.editions = res.result.items;
            }
        });
    }

    openCreateDialog(): void {
        this.editMode = false;
        this.form.reset({ id: 0, isActive: true });
        this.dialogVisible = true;
    }

    editTenant(tenant: Tenant): void {
        this.editMode = true;
        this.form.patchValue(tenant);
        this.dialogVisible = true;
    }

    saveTenant(): void {
        if (this.form.invalid) return;
        
        const tenant = this.form.value;
        console.log('Saving tenant:', tenant);
        
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Tenant ${this.editMode ? 'updated' : 'created'} successfully`
        });
        
        this.dialogVisible = false;
        this.loadTenants({ first: 0, rows: 10 });
    }

    deleteTenant(tenant: Tenant): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${tenant.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                console.log('Deleting tenant:', tenant.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Tenant deleted successfully'
                });
                this.loadTenants({ first: 0, rows: 10 });
            }
        });
    }

    impersonate(tenant: Tenant): void {
        console.log('Impersonating tenant:', tenant.tenancyName);
        this.messageService.add({
            severity: 'info',
            summary: 'Impersonation',
            detail: `Logging in as ${tenant.name}`
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
            const fieldConfig = this.formFields.find((f) => f.key === fieldKey);
            if (fieldConfig) {
                Object.keys(field.errors).forEach((errorKey) => {
                    if (fieldConfig.errorMessages[errorKey]) {
                        errors.push(fieldConfig.errorMessages[errorKey]);
                    }
                });
            }
        }
        return errors;
    }
}

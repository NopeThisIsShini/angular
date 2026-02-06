import { Component, ViewChild, inject, viewChild, Signal, computed, signal, effect, untracked } from '@angular/core';
import { roleResponse, RolesModel } from '../../../models';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { PermissionComponent } from '../../../../shared/components';
import { ColumnDef, FormField, TableAction } from '../../../../shared/models';
import { validationConstants } from '../../../../utils/constant';
import { SharedModule } from '@/app/shared/shared.imports';
import { RoleStore } from '@/app/store';
import { PermissionService } from '@/app/shared/services';

interface menuItem {
    route: string;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-role',
    imports: [SharedModule, PermissionComponent],
    templateUrl: './role.component.html',
    styleUrl: './role.component.scss'
})
export class RoleComponent {
    private store = inject(RoleStore);
    private messageService = inject(MessageService);
    private authConfirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);
    private permissionService = inject(PermissionService);

    permissionComponent = viewChild(PermissionComponent);

    // State from store
    roles = this.store.roles;
    totalCount = this.store.totalCount;
    loading = this.store.isLoading;
    operationStatus = this.store.operationStatus;
    isSaving = computed(() => this.operationStatus().status === 'executing');

    tabs: menuItem[] = [
        { route: 'role', label: 'Role Details', icon: 'pi pi-info-circle' },
        { route: 'permission', label: 'Permissions', icon: 'pi pi-sitemap' }
    ];
    
    activeTab = signal<string>('role');
    editMode = signal<boolean>(false);
    showCreateEditRole = signal<boolean>(false);

    rolePermissions = signal<string[]>([]);

    form = this.fb.group({
        id: [0],
        name: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
        slug: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
        description: [''],
        grantedPermissions: [[] as string[]]
    });

    formFields: FormField[] = [
        { key: 'name', label: 'Name', type: 'text', validators: [], errorMessages: { required: 'Name is required.', pattern: 'Only letters and spaces allowed.' }, mark: true },
        { key: 'slug', label: 'Slug', type: 'text', validators: [], errorMessages: { required: 'Slug is required.', pattern: 'Only letters and spaces allowed.' }, mark: true },
        { key: 'description', label: 'Description', type: 'text', validators: [], errorMessages: {} }
    ];

    columns: ColumnDef[] = [
        { field: 'name', header: 'Name' },
        { field: 'slug', header: 'Slug' },
        { field: 'description', header: 'Description' }
    ];

    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            permission: 'Administration.Roles.Edit',
            command: (data: RolesModel) => this.openUpdateUi(data)
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            outlined: true,
            severity: 'danger',
            permission: 'Administration.Roles.Delete',
            command: (data: RolesModel) => this.deleteRoles(data)
        }
    ];

    constructor() {
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

    getallRoles(event: TableLazyLoadEvent) {
        this.store.loadRoles({
            keyword: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
            skipCount: event.first ?? 0,
            maxResultCount: event.rows ?? 10
        });
    }

    createNewRole() {
        this.editMode.set(false);
        this.activeTab.set('role');
        this.permissionService.clearRolePermissions();
        this.rolePermissions.set([]);
        this.form.reset({ id: 0, grantedPermissions: [] });
        this.showCreateEditRole.set(true);
    }

    onTabChange(tab: any) {
        this.activeTab.set(tab);
        if (tab === 'permission') {
            // Logic handled by input binding in template
        }
    }

    deleteRoles(role: RolesModel): void {
        this.authConfirmationService.confirm({
            message: `Are you sure you want to delete role "${role.name}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.store.deleteRole(role.id, role.name);
            }
        });
    }

    openUpdateUi(role: RolesModel) {
        this.editMode.set(true);
        this.showCreateEditRole.set(true);
        this.permissionService.loadRolePermissions(role.grantedPermissions);
        this.rolePermissions.set(role.grantedPermissions || []);
        this.form.patchValue({
            id: role.id,
            name: role.name,
            slug: role.slug,
            description: role.description,
            grantedPermissions: role.grantedPermissions
        });
    }

    hideDialog() {
        this.showCreateEditRole.set(false);
        this.form.reset();
        this.activeTab.set('role');
        this.rolePermissions.set([]);
        this.permissionService.clearRolePermissions();
    }

    onPermissionsChanged(event: { data: string[] }) {
        this.rolePermissions.set(event.data);
        this.form.patchValue({ grantedPermissions: event.data });
    }

    saveRole() {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        
        const { id, ...data } = this.form.getRawValue();
        const payload = {
            ...data,
            ...(this.editMode() && { id })
        };
        this.store.saveRole(payload as RolesModel, this.editMode());
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
            Object.keys(field.errors).forEach((errorKey) => {
                let msg = fieldConfig?.errorMessages[errorKey];
                if (!msg) {
                    // Fallback messages
                    if (errorKey === 'required') msg = 'This field is required.';
                    if (errorKey === 'email') msg = 'Invalid email address.';
                    if (errorKey === 'pattern') msg = 'Invalid format.';
                }
                if (msg) errors.push(msg);
            });
        }
        return errors;
    }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { roleResponse, RolesModel } from '../../../models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { RoleService } from '../../../services/api/role.service';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { PermissionComponent } from '../../../../shared/components';
import { ColumnDef, FormField, TableAction } from '../../../../shared/models';
import { validationConstants } from '../../../../utils/constant';
import { SharedModule } from '@app/shared/shared.imports';

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
export class RoleComponent implements OnInit {
    @ViewChild('dt') dt!: Table;
    tabs!: menuItem[];
    activeTab: string = 'role';
    totalCount: number = 0;
    editMode: boolean = false;
    Rolesdata: any[] = [];
    items!: MenuItem[];
    loading: boolean = true;
    showCreateEditRole: boolean = false;
    form!: FormGroup;
    selectedRoleData: RolesModel | null = null;
    @ViewChild('permissionComponent') permissionComponent!: PermissionComponent;

    formFields: FormField[] = [
        {
            key: 'name',
            label: 'Name',
            type: 'text',
            mark: true,
            validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
            errorMessages: {
                required: 'Name is required.',
                pattern: 'Only alphabet values are allowed.'
            }
        },
        {
            key: 'displayName',
            label: 'Display Name',
            type: 'text',
            mark: true,
            validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
            errorMessages: {
                required: 'Display Name is required.',
                pattern: 'Only alphabet values are allowed.'
            }
        },
        {
            key: 'description',
            label: 'Description',
            type: 'text',
            validators: [],
            errorMessages: {}
        }
    ];
    columns: ColumnDef[] = [
        { field: 'name', header: 'Name' },
        { field: 'displayName', header: 'Display Name' },
        { field: 'normalizedName', header: 'Normalized Name' },
        { field: 'description', header: 'Description' }
    ];
    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: (data: RolesModel) => {
                this.openUpdateUi(data);
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            outlined: true,
            severity: 'danger',
            command: (data: RolesModel) => {
                this.deleteRoles(data);
                // this.deleteRole(data);
            }
        }
    ];
    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private roleService: RoleService,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.initializeForm();
        this.loadTabs();
    }

    private initializeForm(): void {
        const formControls: any = {};

        this.formFields.forEach((field) => {
            formControls[field.key] = ['', field.validators || []];
        });
        formControls['normalizedName'] = ['', [Validators.required]];
        formControls['grantedPermissions'] = ['', [Validators.required]];
        formControls['id'] = [0, [Validators.required]];
        this.form = this.fb.group(formControls);

        this.form.get('name')?.valueChanges.subscribe((nameValue: string) => {
            const normalized = nameValue ? nameValue.toUpperCase() : '';
            this.form.get('normalizedName')?.setValue(normalized, { emitEvent: false });
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
            // Check in formFields first
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
    getallRoles(event: TableLazyLoadEvent) {
        this.roleService
            .getallRoles({
                SearchTerm: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
                SkipCount: event.first ?? 0,
                MaxResultCount: event.rows ?? undefined
            })
            .subscribe({
                next: (res) => {
                    this.Rolesdata = res.result.items;
                    this.totalCount = res.result.totalCount;
                    this.loading = false;
                },
                error: (err) => {
                    this.loading = false;
                }
            });
    }
    loadTabs() {
        this.tabs = [
            { route: 'role', label: 'role', icon: 'pi pi-link' },
            {
                route: 'permission',
                label: 'permission',
                icon: 'pi pi-sitemap'
            }
        ];
    }
    createNewRole() {
        this.showCreateEditRole = true;
    }
    onTabChange(tab: any) {
        this.activeTab = tab;
        if (tab === 'permission' && this.selectedRoleData) {
            setTimeout(() => {
                this.getRoleDetails(this.selectedRoleData as RolesModel);
            }, 0);
        }
    }

    deleteRoles(role: RolesModel): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${role.name}"?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                variant: 'text'
            },
            acceptButtonProps: {
                severity: 'danger',
                label: 'Yes'
            },
            accept: () => {
                this.deleteRoleById(role.id);
            }
        });
    }
    deleteRoleById(id: number) {
        this.roleService.deleteRoleByid(id).subscribe({
            next: (res) => {},
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Role not deleted'
                });
            },
            complete: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Role deleted successfully'
                });
                this.getallRoles({ first: 0, rows: 5, globalFilter: '' });
            }
        });
    }

    openUpdateUi(RoleData: RolesModel) {
        this.editMode = true;
        if (this.editMode) {
            this.showCreateEditRole = true;
        }
        setTimeout(() => {
            this.selectedRoleData = RoleData;
            this.getRoleDetails(this.selectedRoleData as RolesModel);
        }, 0);
    }

    getRoleDetails(details: RolesModel) {
        this.form.patchValue({
            id: details.id,
            name: details.name,
            displayName: details.displayName,
            description: details.description,
            normalizedName: details.normalizedName,
            grantedPermissions: details.grantedPermissions
        });
        this.permissionComponent.loadPermissionsFromApiResponse(details.grantedPermissions);
    }

    hideDialog() {
        this.showCreateEditRole = false;
        this.form.reset();
        this.permissionComponent.loadPermissionsFromApiResponse([]);
    }
    getPermissions(event: { data: string[] }) {
        this.form.patchValue({ grantedPermissions: event.data });
    }
    saveRole() {
        this.loading = true;
        this.roleService.saveRole(this.form.value, this.editMode).subscribe({
            next: (res: roleResponse) => {},
            error: (err) => {
                this.loading = false;
            },
            complete: () => {
                this.getallRoles({ first: 0, rows: 10 });
                this.hideDialog();
                this.loading = false;
            }
        });
    }
}

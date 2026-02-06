import { Component, ElementRef, TemplateRef, ViewChild, inject, viewChild, effect, signal, computed, untracked } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@/app/shared/shared.imports';
import { ColumnDef, FormField, TableAction } from '@/app/shared/models';
import { validationConstants } from '@/app/utils/constant';
import { RolesModel, UsersModel } from '@/app/pages/models';
import { getFilterValues, getSeverity } from '@/app/shared/functions';
import { UserStore } from '@/app/store';

@Component({
    selector: 'app-user',
    imports: [SharedModule],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserComponent {
    private store = inject(UserStore);
    private authConfirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);

    isActiveTemplate = viewChild<TemplateRef<any>>('isActiveTemplate');

    // State from store
    users = this.store.users;
    totalCount = this.store.totalCount;
    loading = this.store.isLoading;
    rolesList = this.store.roles;
    operationStatus = this.store.operationStatus;
    isSaving = computed(() => this.operationStatus().status === 'executing');

    getSeverity = getSeverity;
    getFilterValues = getFilterValues;

    showCreateEditUserDialog = signal<boolean>(false);
    isEditMode = signal<boolean>(false);
    form = this.fb.nonNullable.group({
        id: [0],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(validationConstants.PASSWORD_PATTERN)]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        roleIds: [null as any, [Validators.required]]
    });

    formFields: FormField[] = [
        { key: 'email', label: 'Email Address', type: 'text', validators: [], errorMessages: { required: 'Email is required.', email: 'Invalid email.' }, mark: true },
        { key: 'password', label: 'Password', type: 'password', validators: [], errorMessages: { required: 'Password is required.', pattern: 'Complexity requirements not met.' }, mark: true },
        { key: 'firstName', label: 'First Name', type: 'text', validators: [], errorMessages: { required: 'First Name is required.', pattern: 'Only letters and spaces allowed.' }, mark: true },
        { key: 'lastName', label: 'Last Name', type: 'text', validators: [], errorMessages: { required: 'Last Name is required.', pattern: 'Only letters and spaces allowed.' }, mark: true },
        { key: 'phone', label: 'Phone Number', type: 'text', validators: [], errorMessages: { required: 'Phone is required.', pattern: '10 digits required.' }, mark: true },
        { key: 'roleIds', label: 'Role', type: 'select', validators: [], errorMessages: { required: 'Role is required.' }, mark: true }
    ];

    columns: ColumnDef[] = [
        { field: 'firstName', header: 'Name' },
        { field: 'email', header: 'Email Address' },
        { field: 'phone', header: 'Phone Number' },
        { field: 'status', header: 'Status' }
    ];

    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            tooltip: 'Edit User',
            severity: 'primary',
            permission: 'Administration.Users.Edit',
            command: (user: UsersModel) => this.triggerEditUser(user, true)
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            tooltip: 'Delete User',
            severity: 'danger',
            outlined: true,
            permission: 'Administration.Users.Delete',
            command: (user: UsersModel) => this.deleteUser(user)
        }
    ];

    constructor() {
        this.store.loadRoles();

        // Reactively handle operation results (Toasts & Dialog closure)
        effect(() => {
            const op = this.operationStatus();
            if (op.status === 'success') {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: op.message
                });
                
                if (op.action === 'create' || op.action === 'edit') {
                    this.closeDialog();
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

        // Reactively set templates once they are available
        effect(() => {
            const template = this.isActiveTemplate();
            if (template) {
                const statusCol = this.columns.find((c) => c.field === 'status');
                if (statusCol) statusCol.template = template;
            }
        });
    }

    getallusers(event: TableLazyLoadEvent) {
        this.store.loadUsers({
            keyword: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
            skipCount: event.first ?? 0,
            maxResultCount: event.rows ?? 10
        });
    }

    createEditUser(isEdit: boolean = false) {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;

        const { id, ...formValue } = this.form.getRawValue();
        const input: UsersModel = {
            ...formValue,
            status: true,
            roleIds: [formValue.roleIds],
            ...(isEdit && { id })
        };

        this.store.saveUser(input, isEdit);
    }

    deleteUser(user: UsersModel) {
        this.authConfirmationService.confirm({
            message: `Are you sure you want to delete user ${user.email}?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.store.deleteUser(user.id!, user.email);
            }
        });
    }

    closeDialog() {
        this.showCreateEditUserDialog.set(false);
        this.form.reset();
        this.isEditMode.set(false);
    }

    triggerEditUser(data: UsersModel | null, isEdit: boolean = false) {
        if (data && isEdit) {
            const matchedRole = this.store.roles().find((r) => r.id === data.roleIds[0]);
            this.form.patchValue({
                ...data,
                roleIds: matchedRole?.id
            });
        } else {
            this.form.reset({ id: 0 });
        }

        this.isEditMode.set(isEdit);
        this.showCreateEditUserDialog.set(true);
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

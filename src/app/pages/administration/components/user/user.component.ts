import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@app/shared/shared.imports';
import { ColumnDef, FormField, TableAction } from '@app/shared/models';
import { validationConstants } from '@app/utils/constant';
import { RolesModel, UsersModel } from '@app/pages/models';
import { getFilterValues, getSeverity } from '@app/shared/functions';
import { UsersService } from '@app/pages/services';

@Component({
    selector: 'app-user',
    imports: [SharedModule],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, AfterViewInit {
    @ViewChild('dt') dt!: Table;
    items: any[] = [];
    rolesList: RolesModel[] = [];
    getSeverity = getSeverity;
    formFields: FormField[] = [
        // {
        //     key: 'userName',
        //     label: 'User Name',
        //     type: 'text',
        //     validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
        //     errorMessages: {
        //         required: 'User Name is required.',
        //         pattern: 'Only alphabet values are allowed.'
        //     }
        // },
        {
            key: 'email',
            label: 'Email Address',
            type: 'text',
            validators: [Validators.required, Validators.email],
            errorMessages: {
                required: 'Email Address is required.',
                email: 'Email Address must be a valid email.'
            }
        },
        {
            key: 'password',
            label: 'Password',
            type: 'password',
            validators: [Validators.required, Validators.pattern(validationConstants.PASSWORD_PATTERN)],
            errorMessages: {
                required: 'Password is required.',
                pattern: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.'
            }
        },
        {
            key: 'firstName',
            label: 'First Name',
            type: 'text',
            validators: [Validators.required],
            errorMessages: {
                required: 'First Name is required.',
                whitespace: 'First Name cannot be empty.'
            }
        },
        {
            key: 'lastName',
            label: 'Last Name',
            type: 'text',
            validators: [Validators.required],
            errorMessages: {
                required: 'Last Name is required.',
                whitespace: 'Last Name cannot be empty.'
            }
        },

        {
            key: 'phone',
            label: 'Phone Number',
            type: 'text',
            validators: [Validators.required, Validators.pattern(/^\d{10}$/)],
            errorMessages: {
                required: 'Phone Number is required.',
                pattern: 'Phone Number must be a valid phone number.'
            }
        },
        {
            key: 'roleIds',
            label: 'Role',
            type: 'select', // handled by app-select
            validators: [Validators.required],
            errorMessages: {
                required: 'Role is required.'
            }
        }
    ];
    users: UsersModel[] = [];
    totalCount: number = 0;
    loading: boolean = true;
    getFilterValues = getFilterValues;
    @ViewChild('filter') filter!: ElementRef;
    @ViewChild('isActiveTemplate') isActiveTemplate!: TemplateRef<any>;
    showCreateEditUserDialog: boolean = false;
    form!: FormGroup;
    isEditMode: boolean = false;
    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private userService: UsersService
    ) {}
    columns: ColumnDef[] = [
        {
            field: 'firstName',
            header: 'Name'
        },
        {
            field: 'email',
            header: 'Email Address'
        },
        {
            field: 'phone',
            header: 'Phone Number'
        },
        {
            field: 'status',
            header: 'Status'
        }
    ];
    actions: TableAction[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            tooltip: 'Edit User',
            severity: 'primary',
            permission: 'Administration.Users.Edit',
            command: (user: UsersModel) => {
                this.triggerEditUser(user, true);
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            tooltip: 'Delete User',
            severity: 'danger',
            outlined: true,
            permission: 'Administration.Users.Delete',
            command: (user: UsersModel) => {
                // this.deleteCustomer(customer);
            }
        }
    ];
    ngOnInit(): void {
        this.getAllRoles();
        this.initializeForm();
    }
    ngAfterViewInit(): void {
        this.columns.find((col) => col.field === 'status')!.template = this.isActiveTemplate;
    }
    initializeForm() {
        const formControls: any = {};

        this.formFields.forEach((field) => {
            formControls[field.key] = ['', field.validators || []];
        });
        this.form = this.fb.group(formControls);
    }
    getallusers(event: TableLazyLoadEvent) {
        this.loading = true;
        this.userService
            .getallusers({
                keyword: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
                skipCount: event.first ?? 0,
                maxResultCount: event.rows ?? undefined
            })
            .subscribe({
                next: (res) => {
                    this.users = res.result.items;
                    this.totalCount = res.result.totalCount;
                },
                error: (err) => {},
                complete: () => {
                    this.loading = false;
                }
            });
    }

    getAllRoles() {
        this.userService.getRoles().subscribe((res) => {
            this.rolesList = res.result.items;
            console.log(this.rolesList);
        });
    }

    createEditUser(isEdit: boolean = false) {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        const formValue = this.form.getRawValue();
        const isActive = true;
        const input: UsersModel = {
            ...formValue,
            isActive,
            roleIds: [formValue.roleIds],
            id: isEdit ? formValue.id : 0
        };
        this.userService.saveUser(input, isEdit).subscribe({
            next: (res) => {},
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: isEdit ? 'User not updated' : 'User not created'
                });
            },
            complete: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEdit ? 'User updated successfully' : 'User created successfully'
                });
                this.getallusers({ first: 0, rows: 5, globalFilter: '' });
                this.showCreateEditUserDialog = false;
                this.closeDialog();
            }
        });
    }

    closeDialog() {
        this.showCreateEditUserDialog = false;
        this.form.reset();
        this.isEditMode = false;
    }

    triggerEditUser(data: UsersModel | null, isEdit: boolean = false) {
        let matchedRole: RolesModel | undefined;
        if (data && isEdit) {
            matchedRole = this.rolesList.find((r) => r.id === data.roleIds[0]);
        }
        this.form.patchValue({
            ...data, // spread object properties
            roleIds: matchedRole?.id // override/ensure roleNames is patched
        });

        this.isEditMode = isEdit;
        this.showCreateEditUserDialog = true;
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
}

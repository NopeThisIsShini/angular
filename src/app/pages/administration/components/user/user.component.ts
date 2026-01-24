import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { SharedModule } from '@app/shared/shared.imports';
import { ColumnDef, FormField, UserScopeContext } from '@app/shared/models';
import { validationConstants } from '@app/utils/constant';
import { RolesModel, UsersModel } from '@app/pages/models';
import { getFilterValues, getSeverity } from '@app/shared/functions';
import { UsersService, OrganizationService } from '@app/pages/services';
import { OUScopingService } from '@app/shared/services/ou-scoping.service';

@Component({
    selector: 'app-user',
    standalone: true,
    imports: [SharedModule],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, AfterViewInit {
    @ViewChild('dt') dt!: Table;

    items: any[] = [];
    rolesList: RolesModel[] = [];
    organizationUnits: any[] = [];
    getSeverity = getSeverity;
    formFields: FormField[] = [
        {
            key: 'userName',
            label: 'User Name',
            type: 'text',
            validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
            errorMessages: {
                required: 'User Name is required.',
                pattern: 'Only alphabet values are allowed.'
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
            key: 'name',
            label: 'First Name',
            type: 'text',
            validators: [Validators.required],
            errorMessages: {
                required: 'First Name is required.',
                whitespace: 'First Name cannot be empty.'
            }
        },
        {
            key: 'surname',
            label: 'Last Name',
            type: 'text',
            validators: [Validators.required],
            errorMessages: {
                required: 'Last Name is required.',
                whitespace: 'Last Name cannot be empty.'
            }
        },
        {
            key: 'emailAddress',
            label: 'Email Address',
            type: 'text',
            validators: [Validators.required, Validators.email],
            errorMessages: {
                required: 'Email Address is required.',
                email: 'Email Address must be a valid email.'
            }
        },
        {
            key: 'phoneNumber',
            label: 'Phone Number',
            type: 'text',
            validators: [Validators.required, Validators.pattern(/^\d{10}$/)],
            errorMessages: {
                required: 'Phone Number is required.',
                pattern: 'Phone Number must be a valid phone number.'
            }
        },
        {
            key: 'roleNames',
            label: 'Role',
            type: 'select', // handled by app-select
            validators: [Validators.required],
            errorMessages: {
                required: 'Role is required.'
            }
        },
        {
            key: 'organizationUnitId',
            label: 'Organization Unit',
            type: 'select',
            validators: [],
            errorMessages: {}
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
    currentUserScope: UserScopeContext | null = null;
    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private userService: UsersService,
        private organizationService: OrganizationService,
        private ouScopingService: OUScopingService
    ) {}
    columns: ColumnDef[] = [
        {
            field: 'fullName',
            header: 'Name'
        },
        {
            field: 'organizationUnitName',
            header: 'Organization Unit'
        },
        {
            field: 'emailAddress',
            header: 'Email Address'
        },
        {
            field: 'phoneNumber',
            header: 'Phone Number'
        },
        {
            field: 'status',
            header: 'Status'
        }
    ];
    actions: any[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            tooltip: 'Edit User',
            severity: 'primary',
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
            command: (user: UsersModel) => {
                // this.deleteCustomer(customer);
            }
        }
    ];
    ngOnInit(): void {
        this.currentUserScope = this.ouScopingService.getCurrentUser();
        this.getAllRoles();
        this.getOrganizationUnits();
        this.initializeForm();
    }

    getOrganizationUnits() {
        this.organizationService.getTree().subscribe((res: any) => {
            this.organizationUnits = res.result.items;
        });
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
                SearchTerm: typeof event.globalFilter === 'string' ? event.globalFilter : undefined,
                SkipCount: event.first ?? 0,
                MaxResultCount: event.rows ?? undefined
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
            roleNames: [formValue.roleNames],
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
            matchedRole = this.rolesList.find((r) => r.normalizedName === data.roleNames[0]);
        }
        this.form.patchValue({
            ...data, // spread object properties
            roleNames: matchedRole?.name // override/ensure roleNames is patched
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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { validationConstants } from '@app/utils/constant';
import { AuthService } from '@app/pages/services';
import { signupRequest } from '@app/pages/models';
import { SharedModule } from '@app/shared/shared.imports';

interface signupField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'email';
    placeholder: string;
    validators: any[];
    errorMessages: { [key: string]: string };
}

@Component({
    selector: 'app-signup',
    imports: [SharedModule],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
    Signupform!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authServ: AuthService,
        private messageServ: MessageService,
        private router: Router
    ) {
        this.Signupform = this.fb.group({});
    }

    signupFields: signupField[] = [
        {
            key: 'name',
            label: 'First Name',
            type: 'text',
            placeholder: 'FirstName',
            validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
            errorMessages: {
                required: 'FirstName is required'
            }
        },
        {
            key: 'surname',
            label: 'Last Name',
            type: 'text',
            placeholder: 'LastName',
            validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
            errorMessages: {
                required: 'LastName is required'
            }
        },
        {
            key: 'emailAddress',
            label: 'Email Address',
            type: 'email',
            placeholder: 'EmailAddress',
            validators: [Validators.required, Validators.email],
            errorMessages: {
                required: 'Email Address is required',
                email: 'Invalid email'
            }
        },
        {
            key: 'userName',
            label: 'Username',
            type: 'text',
            placeholder: 'UserName',
            validators: [Validators.required],
            errorMessages: {
                required: 'Username is required'
            }
        },
        {
            key: 'tenancyName',
            label: 'Tenancy Name',
            type: 'text',
            placeholder: 'TenancyName',
            validators: [Validators.required],
            errorMessages: {
                required: 'Tenancy Name is required'
            }
        },
        {
            key: 'tenantName',
            label: 'Tenant Name',
            type: 'text',
            placeholder: 'TenantName',
            validators: [Validators.required],
            errorMessages: {
                required: 'Tenant Name is required'
            }
        },
        {
            key: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Password',
            validators: [Validators.required],
            errorMessages: {
                required: 'Password is required'
            }
        },
        {
            key: 'confirmPassword',
            label: 'Confirm Password',
            type: 'password',
            placeholder: 'ConfirmPassword',
            validators: [Validators.required],
            errorMessages: {
                required: 'Confirm Password is required'
            }
        }
    ];

    ngOnInit(): void {
        this.initializeForm();
    }

    onSignup(): void {
        if (this.Signupform.valid) {
            if (this.Signupform.value.password !== this.Signupform.value.confirmPassword) {
                this.Signupform.get('confirmPassword')?.setErrors({
                    passwordMismatch: true
                });
                return;
            }
            const payload: signupRequest = {
                firstName: this.Signupform.value.name,
                surname: this.Signupform.value.surname,
                userName: this.Signupform.value.userName,
                emailAddress: this.Signupform.value.emailAddress,
                password: this.Signupform.value.password,
                captchaResponse: '',
                tenancyName: this.Signupform.value.tenancyName,
                name: this.Signupform.value.tenantName,
                isActive: true
            };

            this.authServ.signup(payload).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.messageServ.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Account created successfully!'
                        });
                        this.router.navigate(['/auth/login']);
                    } else {
                        this.messageServ.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: res.error?.message || 'Signup failed'
                        });
                    }
                },
                error: (err) => {
                    this.messageServ.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err?.error?.error?.message || 'Something went wrong'
                    });
                }
            });
        }
    }

    private initializeForm(): void {
        const formControls: any = {};

        // Add text/password/number fields
        this.signupFields.forEach((field) => {
            formControls[field.key] = ['', field.validators];
        });

        this.Signupform = this.fb.group(formControls);
    }
    isFieldInvalid(fieldKey: string): boolean {
        const field = this.Signupform.get(fieldKey);
        return !!(field?.invalid && (field?.dirty || field?.touched));
    }

    getFieldErrors(fieldKey: string): string[] {
        const field = this.Signupform.get(fieldKey);
        const errors: string[] = [];

        if (field?.errors && this.isFieldInvalid(fieldKey)) {
            const fieldConfig = this.signupFields.find((f) => f.key === fieldKey);
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

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { validationConstants } from '@/app/utils/constant';
import { AuthService } from '@/app/pages/services';
import { signupRequest } from '@/app/pages/models';
import { SharedModule } from '@/app/shared/shared.imports';

interface SignupField {
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
export class SignupComponent {
    private fb = inject(FormBuilder);
    private authServ = inject(AuthService);
    private messageServ = inject(MessageService);
    private router = inject(Router);

    isLoading = signal<boolean>(false);

    signupFields: SignupField[] = [
        {
            key: 'name', label: 'First Name', type: 'text', placeholder: 'FirstName',
            validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
            errorMessages: { required: 'FirstName is required' }
        },
        {
            key: 'surname', label: 'Last Name', type: 'text', placeholder: 'LastName',
            validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
            errorMessages: { required: 'LastName is required' }
        },
        {
            key: 'emailAddress', label: 'Email Address', type: 'email', placeholder: 'EmailAddress',
            validators: [Validators.required, Validators.email],
            errorMessages: { required: 'Email Address is required', email: 'Invalid email' }
        },
        {
            key: 'userName', label: 'Username', type: 'text', placeholder: 'UserName',
            validators: [Validators.required],
            errorMessages: { required: 'Username is required' }
        },
        {
            key: 'tenancyName', label: 'Tenancy Name', type: 'text', placeholder: 'TenancyName',
            validators: [Validators.required],
            errorMessages: { required: 'Tenancy Name is required' }
        },
        {
            key: 'tenantName', label: 'Tenant Name', type: 'text', placeholder: 'TenantName',
            validators: [Validators.required],
            errorMessages: { required: 'Tenant Name is required' }
        },
        {
            key: 'password', label: 'Password', type: 'password', placeholder: 'Password',
            validators: [Validators.required],
            errorMessages: { required: 'Password is required' }
        },
        {
            key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'ConfirmPassword',
            validators: [Validators.required],
            errorMessages: { required: 'Confirm Password is required' }
        }
    ];

    Signupform = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
        surname: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
        emailAddress: ['', [Validators.required, Validators.email]],
        userName: ['', [Validators.required]],
        tenancyName: ['', [Validators.required]],
        tenantName: ['', [Validators.required]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]]
    });

    onSignup(): void {
        if (this.Signupform.valid) {
            const val = this.Signupform.getRawValue();
            if (val.password !== val.confirmPassword) {
                this.Signupform.get('confirmPassword')?.setErrors({
                    passwordMismatch: true
                });
                return;
            }

            const payload: signupRequest = {
                firstName: val.name!,
                surname: val.surname!,
                userName: val.userName!,
                emailAddress: val.emailAddress!,
                password: val.password!,
                captchaResponse: '',
                tenancyName: val.tenancyName!,
                name: val.tenantName!,
                isActive: true
            };

            this.isLoading.set(true);
            this.authServ.signup(payload).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.messageServ.add({ severity: 'success', summary: 'Success', detail: 'Account created successfully!' });
                        this.router.navigate(['/auth/login']);
                    } else {
                        this.messageServ.add({ severity: 'error', summary: 'Error', detail: res.error?.message || 'Signup failed' });
                    }
                },
                error: (err) => {
                    this.messageServ.add({
                        severity: 'error', summary: 'Error',
                        detail: err?.error?.error?.message || 'Something went wrong'
                    });
                },
                complete: () => this.isLoading.set(false)
            });
        } else {
            this.Signupform.markAllAsTouched();
        }
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

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SharedModule } from '@app/shared/shared.imports';
import { validationConstants } from '@app/utils/constant';
import { CheckboxField, FormField } from '@app/shared/models';
import { EmailSettings, EmailSettingsResponse } from '@app/pages/models';
import { SmtpService } from '@app/pages/services';

@Component({
    selector: 'app-smtp',
    imports: [SharedModule],
    templateUrl: './smtp.component.html',
    styleUrl: './smtp.component.scss'
})
export class SmtpComponent {
    emailSettingsForm!: FormGroup;
    myEmail!: EmailSettings;

    formFields: FormField[] = [
        {
            key: 'emailAddress',
            label: 'Email Address',
            type: 'text',
            validators: [Validators.required, Validators.pattern(validationConstants.EMAIL_PATTERN)],
            errorMessages: {
                required: 'Email Address is required.',
                pattern: 'Please enter a valid email address.'
            }
        },
        {
            key: 'name',
            label: 'Name',
            type: 'text',
            // validators: [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)],
            validators: [Validators.required],

            errorMessages: {
                required: 'Name is required.',
                pattern: 'Only alphabet values are allowed.'
            }
        },
        {
            key: 'smtpHost',
            label: 'SMTP Host',
            type: 'text',
            validators: [Validators.required],

            errorMessages: {
                required: 'SMTP Host is required.'
            }
        },
        {
            key: 'smtpPort',
            label: 'SMTP Port',
            type: 'number',
            validators: [Validators.required, Validators.min(1), Validators.max(65535)],

            errorMessages: {
                required: 'SMTP Port is required.',
                min: 'Port must be greater than 0.',
                max: 'Port must be less than 65536.'
            }
        },
        {
            key: 'username',
            label: 'Username',
            type: 'text',
            validators: [Validators.required],

            errorMessages: {
                required: 'Username is required.'
            }
        },
        {
            key: 'password',
            label: 'Password',
            type: 'password',
            validators: [Validators.required, Validators.minLength(6)],

            errorMessages: {
                required: 'Password is required.',
                minlength: 'Password must be at least 6 characters long.'
            }
        },
        {
            key: 'domainName',
            label: 'Domain Name',
            type: 'text',
            validators: [Validators.required],

            errorMessages: {
                required: 'Domain Name is required.'
            }
        }
    ];

    checkboxFields: CheckboxField[] = [
        {
            key: 'useSsl',
            label: 'Use SSL'
        },
        {
            key: 'useDefaultCredentials',
            label: 'Use Default Credentials'
        }
    ];

    constructor(
        private fb: FormBuilder,
        private smtpService: SmtpService,
        private messageServ: MessageService
    ) {}

    ngOnInit(): void {
        this.initializeForm();
        this.getEmail();
    }

    private initializeForm(): void {
        const formControls: any = {};

        // Add text/password/number fields
        this.formFields.forEach((field) => {
            formControls[field.key] = ['', field.validators];
        });

        // Add checkbox fields
        this.checkboxFields.forEach((field) => {
            formControls[field.key] = [false];
        });

        this.emailSettingsForm = this.fb.group(formControls);
    }

    private markAllFieldsAsTouched(): void {
        Object.keys(this.emailSettingsForm.controls).forEach((key) => {
            this.emailSettingsForm.get(key)?.markAsTouched();
        });
    }

    isFieldInvalid(fieldKey: string): boolean {
        const field = this.emailSettingsForm.get(fieldKey);
        return !!(field?.invalid && (field?.dirty || field?.touched));
    }

    getFieldErrors(fieldKey: string): string[] {
        const field = this.emailSettingsForm.get(fieldKey);
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

    getEmail() {
        this.smtpService.getMyEmailSettings().subscribe(
            (res) => {
                if (res.success) {
                    this.myEmail = res.result;

                    // Patch emailSettingsForm values
                    this.emailSettingsForm.patchValue({
                        emailAddress: this.myEmail.defaultFromAddress,
                        name: this.myEmail.defaultFromDisplayName,
                        smtpHost: this.myEmail.smtpHost,
                        smtpPort: this.myEmail.smtpPort,
                        username: this.myEmail.smtpUserName,
                        password: this.myEmail.smtpPassword,
                        domainName: this.myEmail.smtpDomain,
                        useSsl: this.myEmail.smtpEnableSsl,
                        useDefaultCredentials: this.myEmail.smtpUseDefaultCredentials
                    });
                } else {
                    this.messageServ.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong!'
                    });
                }
            },
            (err) => {
                this.messageServ.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load email settings!'
                });
                console.error('API error:', err);
            }
        );
    }

    onSubmit(): void {
        if (this.emailSettingsForm.valid) {
            const formValue = this.emailSettingsForm.value;

            // Map formValue into backend payload shape
            const payload: EmailSettingsResponse = {
                email: {
                    defaultFromAddress: formValue.emailAddress,
                    defaultFromDisplayName: formValue.name,
                    smtpHost: formValue.smtpHost,
                    smtpPort: formValue.smtpPort,
                    smtpUserName: formValue.username,
                    smtpPassword: formValue.password,
                    smtpEnableSsl: formValue.useSsl,
                    smtpUseDefaultCredentials: formValue.useDefaultCredentials,
                    smtpDomain: formValue.domainName
                }
            };

            this.smtpService.updateAllSettings(payload).subscribe({
                next: (res) => {
                    if (res && res.success) {
                        this.messageServ.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Email settings updated successfully!'
                        });
                        this.getEmail(); // refresh latest settings
                    }
                },
                error: (err) => {
                    this.messageServ.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update email settings!'
                    });
                }
            });
        } else {
            this.markAllFieldsAsTouched();
        }
    }
}

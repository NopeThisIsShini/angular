import { Component, inject, effect, computed, untracked } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SharedModule } from '@/app/shared/shared.imports';
import { validationConstants } from '@/app/utils/constant';
import { CheckboxField, FormField } from '@/app/shared/models';
import { SmtpStore } from '@/app/store';

@Component({
    selector: 'app-smtp',
    imports: [SharedModule],
    templateUrl: './smtp.component.html',
    styleUrl: './smtp.component.scss'
})
export class SmtpComponent {
    private store = inject(SmtpStore);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);

    // State from store
    emailSettings = this.store.emailSettings;
    loading = this.store.isLoading;
    operationStatus = this.store.operationStatus;
    isSaving = computed(() => this.operationStatus().status === 'executing');

    formFields: FormField[] = [
        { 
            key: 'emailAddress', label: 'Email Address', type: 'text', validators: [], 
            errorMessages: { required: 'Email Address is required.', pattern: 'Please enter a valid email address.' } 
        },
        { key: 'name', label: 'Name', type: 'text', validators: [], errorMessages: { required: 'Name is required.' } },
        { key: 'smtpHost', label: 'SMTP Host', type: 'text', validators: [], errorMessages: { required: 'SMTP Host is required.' } },
        { 
            key: 'smtpPort', label: 'SMTP Port', type: 'number', validators: [], 
            errorMessages: { required: 'SMTP Port is required.', min: 'Port must be greater than 0.', max: 'Port must be less than 65536.' } 
        },
        { key: 'username', label: 'Username', type: 'text', validators: [], errorMessages: { required: 'Username is required.' } },
        { 
            key: 'password', label: 'Password', type: 'password', validators: [], 
            errorMessages: { required: 'Password is required.', minlength: 'Password must be at least 6 characters long.' } 
        },
        { key: 'domainName', label: 'Domain Name', type: 'text', validators: [], errorMessages: { required: 'Domain Name is required.' } }
    ];

    checkboxFields: CheckboxField[] = [
        { key: 'useSsl', label: 'Use SSL' },
        { key: 'useDefaultCredentials', label: 'Use Default Credentials' }
    ];

    form = this.fb.group({
        emailAddress: ['', [Validators.required, Validators.pattern(validationConstants.EMAIL_PATTERN)]],
        name: ['', [Validators.required]],
        smtpHost: ['', [Validators.required]],
        smtpPort: [null as number | null, [Validators.required, Validators.min(1), Validators.max(65535)]],
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        domainName: ['', [Validators.required]],
        useSsl: [false],
        useDefaultCredentials: [false]
    });

    constructor() {
        this.store.loadEmailSettings();

        // Reactive form patching
        effect(() => {
            const s = this.emailSettings();
            if (s) {
                this.form.patchValue({
                    emailAddress: s.defaultFromAddress,
                    name: s.defaultFromDisplayName,
                    smtpHost: s.smtpHost,
                    smtpPort: s.smtpPort,
                    username: s.smtpUserName,
                    password: s.smtpPassword,
                    domainName: s.smtpDomain,
                    useSsl: s.smtpEnableSsl,
                    useDefaultCredentials: s.smtpUseDefaultCredentials
                }, { emitEvent: false });
            }
        });

        // Reactively handle operation results
        effect(() => {
            const op = this.operationStatus();
            if (op.status === 'success') {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: op.message
                });
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

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const val = this.form.getRawValue();
        const payload: any = {
            email: {
                defaultFromAddress: val.emailAddress,
                defaultFromDisplayName: val.name,
                smtpHost: val.smtpHost,
                smtpPort: val.smtpPort,
                smtpUserName: val.username,
                smtpPassword: val.password,
                smtpEnableSsl: val.useSsl,
                smtpUseDefaultCredentials: val.useDefaultCredentials,
                smtpDomain: val.domainName
            }
        };

        this.store.updateSettings(payload);
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
                    const msg = fieldConfig.errorMessages[errorKey];
                    if (msg) errors.push(msg);
                });
            }
        }
        return errors;
    }
}

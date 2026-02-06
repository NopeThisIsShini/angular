import { Component, inject, effect, signal, computed, untracked } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SharedModule } from '@/app/shared/shared.imports';
import { FormField } from '@/app/shared/models';
import { validationConstants } from '@/app/utils/constant';
import { ProfileStore } from '@/app/store';

@Component({
    selector: 'app-profile',
    imports: [SharedModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent {
    private store = inject(ProfileStore);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);

    // State from store
    profile = this.store.profile;
    loading = this.store.isLoading;
    operationStatus = this.store.operationStatus;
    isSaving = computed(() => this.operationStatus().status === 'executing');

    croppedImage = signal<string | null>(null);

    formFields: FormField[] = [
        { key: 'firstName', label: 'First Name', type: 'text', validators: [], errorMessages: { required: 'First Name is required.' } },
        { key: 'lastName', label: 'Last Name', type: 'text', validators: [], errorMessages: { required: 'Last Name is required.' } },
        { 
            key: 'userName', label: 'User Name', type: 'text', validators: [], 
            errorMessages: { required: 'User Name is required.', pattern: 'Only alphabet values are allowed.' } 
        },
        { 
            key: 'email', label: 'Email Address', type: 'text', validators: [], 
            errorMessages: { required: 'Email Address is required.', pattern: 'Please enter a valid email address.' } 
        },
        { key: 'profileName', label: 'Profile Name', type: 'text', validators: [], errorMessages: { required: 'Profile Name is required.' } }
    ];

    form = this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        userName: ['', [Validators.required, Validators.pattern(validationConstants.NAME_PATTERN)]],
        email: ['', [Validators.required, Validators.pattern(validationConstants.EMAIL_PATTERN)]],
        profileName: ['', [Validators.required]],
        profilePicture: [null as string | null]
    });

    constructor() {
        this.store.loadProfile();

        // Reactive form patching
        effect(() => {
            const p = this.profile();
            if (p) {
                this.form.patchValue({
                    firstName: p.name,
                    lastName: p.surName,
                    userName: p.userName,
                    email: p.emailAddress,
                    profileName: p.profileName,
                    profilePicture: p.profilePicture
                }, { emitEvent: false });
                this.croppedImage.set(p.profilePicture);
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

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                this.croppedImage.set(result);
                this.form.patchValue({ profilePicture: result });
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const data = this.form.getRawValue();
        const payload = {
            name: data.firstName,
            surName: data.lastName,
            emailAddress: data.email,
            userName: data.userName,
            profileName: data.profileName,
            profilePicture: data.profilePicture
        };

        this.store.updateProfile(payload);
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

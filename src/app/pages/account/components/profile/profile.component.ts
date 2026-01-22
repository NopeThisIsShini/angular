import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SharedModule } from '@app/shared/shared.imports';
import { ProfileData } from '@app/pages/models/api/profile.model';
import { FormField } from '@app/shared/models';
import { ProfileService } from '@app/pages/services';
import { validationConstants } from '@app/utils/constant';

@Component({
    selector: 'app-profile',
    imports: [SharedModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent {
    emailSettingsForm!: FormGroup;
    myProfile!: ProfileData;
    croppedImage: any;
    formFields: FormField[] = [
        {
            key: 'firstName',
            label: 'First Name',
            type: 'text',
            validators: [Validators.required],
            errorMessages: {
                required: 'First Name is required.'
            }
        },
        {
            key: 'lastName',
            label: 'Last Name',
            type: 'text',
            validators: [Validators.required],
            errorMessages: {
                required: 'Last Name is required.'
            }
        },
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
            key: 'email',
            label: 'Email Address',
            type: 'text',
            validators: [Validators.required, Validators.pattern(validationConstants.EMAIL_PATTERN)],

            errorMessages: {
                required: 'Email Address is required.',
                pattern: 'Please enter a valid email address.'
            }
        },
        {
            key: 'profileName',
            label: 'Profile Name',
            type: 'text',
            validators: [Validators.required],

            errorMessages: {
                required: 'Profile Name is required.'
            }
        }
    ];

    constructor(
        private fb: FormBuilder,
        private profileService: ProfileService,
        private messageServ: MessageService
    ) {}

    ngOnInit(): void {
        this.initializeForm();
        this.getProfile();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Preview the selected image
            const reader = new FileReader();
            reader.onload = () => {
                this.croppedImage = reader.result as string;

                // Update form control with base64 (or file, depending on API)
                this.emailSettingsForm.patchValue({
                    profilePicture: this.croppedImage
                });
            };
            reader.readAsDataURL(file);
        }
    }

    private initializeForm(): void {
        const formControls: any = {};

        // Add text/password/number fields
        this.formFields.forEach((field) => {
            formControls[field.key] = ['', field.validators];
        });
        formControls['profilePicture'] = [null];
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

    getProfile() {
        this.profileService.getMyProfile().subscribe((res) => {
            if (res.success) {
                this.myProfile = res.result;
                this.croppedImage = res.result.profilePicture;
                // Patch emailSettingsForm values here
                this.emailSettingsForm.patchValue({
                    firstName: this.myProfile.name,
                    lastName: this.myProfile.surName,
                    userName: this.myProfile.userName,
                    email: this.myProfile.emailAddress,
                    profileName: this.myProfile.profileName,
                    profilePicture: this.croppedImage
                });
            } else {
                this.messageServ.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong!'
                });
            }
        });
    }

    onSubmit(): void {
        if (this.emailSettingsForm.valid) {
            const formData: ProfileData = this.emailSettingsForm.value;
            const payload = {
                name: this.emailSettingsForm.controls['firstName'].value,
                surName: this.emailSettingsForm.controls['lastName'].value,
                emailAddress: this.emailSettingsForm.controls['email'].value,
                userName: this.emailSettingsForm.controls['userName'].value,
                profileName: this.emailSettingsForm.controls['profileName'].value,
                profilePicture: this.emailSettingsForm.controls['profilePicture'].value
            };

            this.profileService.updateProfile(payload).subscribe({
                next: (res) => {
                    if (res && res.result) {
                        this.messageServ.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Profile updated successfully!'
                        });
                        // update signal so HeaderComponent reflects change
                        this.profileService.setProfileImage(res.result.profilePicture);
                        this.profileService.setProfileName(res.result.name);
                        this.getProfile();
                    }
                },
                error: (err) => {
                    this.messageServ.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update profile!'
                    });
                }
            });
        } else {
            this.markAllFieldsAsTouched();
        }
    }
}

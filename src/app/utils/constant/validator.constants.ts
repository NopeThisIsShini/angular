import { AbstractControl, ValidationErrors } from '@angular/forms';

export const validationConstants = {
    NAME_PATTERN: '^[A-Za-z ]+$',
    EMAIL_PATTERN: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$',
    USERNAME_PATTERN: '^[a-zA-Z0-9._-]+$',
    WEB_SITE_PATTERN: '^https://([a-zd-]+.)+[a-z]{2,6}$',
    PHONE_NUMBER: /^\+(?:[0-9] ?){6,14}[0-9]$/,
    PASSWORD_PATTERN: '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}'
};

export function emailOrUsernameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const emailRegex = new RegExp(validationConstants.EMAIL_PATTERN);
    const usernameRegex = new RegExp(validationConstants.USERNAME_PATTERN);

    if (emailRegex.test(value) || usernameRegex.test(value)) {
        return null;
    }
    return { emailOrUsername: true };
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedModule } from '@app/shared/shared.imports';
import { LocalStorageService } from '@app/shared/services';
import { AuthService } from '@app/pages/services';

@Component({
    selector: 'app-login',
    imports: [SharedModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    loginForm!: FormGroup;
    isLoading: boolean = false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private authServ: AuthService,
        private messageServ: MessageService,
        private localStorage: LocalStorageService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required]],
            password: ['', [Validators.required]],
            rememberMe: [false]
        });
    }

    onSignIn(): void {
        if (this.loginForm.valid) {
            const payload = {
                userNameOrEmailAddress: this.loginForm.controls['email'].value,
                password: this.loginForm.controls['password'].value,
                rememberClient: this.loginForm.controls['rememberMe'].value
            };

            this.isLoading = true;

            this.authServ.login(payload).subscribe({
                next: () => {
                    this.messageServ.add({ severity: 'success', summary: 'Success', detail: 'Logged in successfully' });
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    this.messageServ.add({ severity: 'error', summary: 'Error', detail: err.message || 'Login failed' });
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
        }
    }
}

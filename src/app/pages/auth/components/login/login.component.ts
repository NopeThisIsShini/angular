import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedModule } from '@/app/shared/shared.imports';
import { AuthService } from '@/app/pages/services';

@Component({
    selector: 'app-login',
    imports: [SharedModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private authServ = inject(AuthService);
    private messageServ = inject(MessageService);

    loginForm = this.fb.group({
        email: ['', [Validators.required]],
        password: ['', [Validators.required]],
        rememberMe: [false]
    });

    isLoading = signal<boolean>(false);

    onSignIn(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const val = this.loginForm.getRawValue();
        const payload = {
            email: val.email!,
            password: val.password!
        };

        this.isLoading.set(true);

        this.authServ.login(payload).subscribe({
            next: () => {
                this.messageServ.add({ severity: 'success', summary: 'Success', detail: 'Logged in successfully' });
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.messageServ.add({ severity: 'error', summary: 'Error', detail: err.message || 'Login failed' });
            },
            complete: () => {
                this.isLoading.set(false);
            }
        });
    }
}

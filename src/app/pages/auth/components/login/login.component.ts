import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedModule } from '@app/shared/shared.imports';
import { LocalStorageService } from '@app/shared/services';
import { AuthService } from '@app/pages/services';

// Demo login profiles for OU scoping demonstration
export type LoginProfile = 'host' | 'tata-group' | 'titan';

export interface DemoUser {
    key: LoginProfile;
    name: string;
    role: string;
    ouPath: string | null;
    description: string;
    icon: string;
}

@Component({
    selector: 'app-login',
    imports: [SharedModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    loginForm!: FormGroup;
    isLoading: boolean = false;
    loadingProfile: LoginProfile | null = null;

    // Demo users for quick login
    demoUsers: DemoUser[] = [
        {
            key: 'host',
            name: 'Host Admin',
            role: 'Host',
            ouPath: null,
            description: 'Full system access - sees ALL tenants & OUs',
            icon: 'pi pi-server'
        },
        {
            key: 'tata-group',
            name: 'Ratan Tata',
            role: 'Tenant Admin',
            ouPath: '/1/',
            description: 'Tata Group - sees Titan, TCS, Motors & all children',
            icon: 'pi pi-building'
        },
        {
            key: 'titan',
            name: 'Bhaskar Bhat',
            role: 'Manager',
            ouPath: '/1/2/',
            description: 'Titan only - sees Watches, Jewelry divisions',
            icon: 'pi pi-users'
        }
    ];

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

    /**
     * Quick login as one of the demo users
     * This stores the selected profile in localStorage so ConfigService can load the correct session
     */
    quickLogin(profile: LoginProfile): void {
        this.loadingProfile = profile;
        
        // Store the selected session profile
        this.localStorage.setItem('demoSessionProfile', profile);
        
        const payload = {
            userNameOrEmailAddress: profile,
            password: 'demo',
            rememberClient: true
        };

        this.authServ.login(payload).subscribe({
            next: () => {
                const user = this.demoUsers.find(u => u.key === profile);
                this.messageServ.add({ 
                    severity: 'success', 
                    summary: 'Success', 
                    detail: `Logged in as ${user?.name} (${user?.ouPath || 'Host'})` 
                });
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.messageServ.add({ severity: 'error', summary: 'Error', detail: err.message || 'Login failed' });
            },
            complete: () => {
                this.loadingProfile = null;
            }
        });
    }
}


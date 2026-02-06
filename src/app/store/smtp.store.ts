import { Injectable, inject } from '@angular/core';
import { SignalStore } from '@/app/store/signal-store';
import { CallState, callState, getErrorMessage } from '@/app/store/store-utils';
import { EmailSettings, EmailSettingsResponse } from '@/app/pages/models';
import { SmtpService } from '@/app/pages/services';

interface SmtpState {
    emailSettings: EmailSettings | null;
    loadStatus: CallState;
    operationStatus: {
        status: 'idle' | 'executing' | 'success' | 'error';
        message?: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class SmtpStore extends SignalStore<SmtpState> {
    private smtpService = inject(SmtpService);

    readonly emailSettings = this.select(s => s.emailSettings);
    readonly isLoading = this.select(s => s.loadStatus === 'loading');
    readonly operationStatus = this.select(s => s.operationStatus);

    constructor() {
        super({
            emailSettings: null,
            loadStatus: callState(),
            operationStatus: { status: 'idle' }
        });
    }

    loadEmailSettings() {
        this.patchState({ loadStatus: 'loading' });
        this.smtpService.getMyEmailSettings().subscribe({
            next: (res) => {
                this.patchState({
                    emailSettings: res.result,
                    loadStatus: 'loaded'
                });
            },
            error: (err) => {
                this.patchState({ loadStatus: { error: getErrorMessage(err) } });
            }
        });
    }

    updateSettings(payload: EmailSettingsResponse) {
        this.patchState({ operationStatus: { status: 'executing' } });
        
        this.smtpService.updateAllSettings(payload).subscribe({
            next: () => {
                this.patchState({ 
                    operationStatus: { status: 'success', message: 'SMTP settings updated successfully' }
                });
                this.loadEmailSettings();
            },
            error: (err) => {
                this.patchState({ 
                    operationStatus: { status: 'error', message: getErrorMessage(err) }
                });
            }
        });
    }

    resetOperationStatus() {
        this.patchState({ operationStatus: { status: 'idle' } });
    }
}

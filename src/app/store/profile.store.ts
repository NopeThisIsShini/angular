import { Injectable, inject } from '@angular/core';
import { SignalStore } from '@/app/store/signal-store';
import { CallState, callState, getErrorMessage } from '@/app/store/store-utils';
import { ProfileData } from '@/app/pages/models/api/profile.model';
import { ProfileService } from '@/app/pages/services';

interface ProfileState {
    profile: ProfileData | null;
    loadStatus: CallState;
    operationStatus: {
        status: 'idle' | 'executing' | 'success' | 'error';
        message?: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class ProfileStore extends SignalStore<ProfileState> {
    private profileService = inject(ProfileService);

    readonly profile = this.select(s => s.profile);
    readonly isLoading = this.select(s => s.loadStatus === 'loading');
    readonly operationStatus = this.select(s => s.operationStatus);

    constructor() {
        super({
            profile: null,
            loadStatus: callState(),
            operationStatus: { status: 'idle' }
        });
    }

    loadProfile() {
        this.patchState({ loadStatus: 'loading' });
        this.profileService.getMyProfile().subscribe({
            next: (res) => {
                this.patchState({
                    profile: res.result,
                    loadStatus: 'loaded'
                });
            },
            error: (err) => {
                this.patchState({ loadStatus: { error: getErrorMessage(err) } });
            }
        });
    }

    updateProfile(data: any) {
        this.patchState({ operationStatus: { status: 'executing' } });
        
        this.profileService.updateProfile(data).subscribe({
            next: (res) => {
                this.patchState({ 
                    profile: res.result,
                    operationStatus: { status: 'success', message: 'Profile updated successfully' }
                });
                this.profileService.setProfileImage(res.result.profilePicture);
                this.profileService.setProfileName(res.result.name);
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

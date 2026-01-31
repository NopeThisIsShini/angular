import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { ProfileData, UserProfileResult } from '@/app/pages/models';
import { api_routes } from '@/app/utils/routes';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    // default avatar or empty
    profileImage = signal<string>('');
    profileName = signal<string>('');

    setProfileImage(img: string) {
        this.profileImage.set(img);
    }

    setProfileName(name: string) {
        this.profileName.set(name);
    }

    constructor(private httpclint: HttpClient) { }

    getMyProfile(): Observable<UserProfileResult> {
        // API Call - uncomment for production
        // return this.httpclint.get<UserProfileResult>(api_routes.getMyProfile);
        // Local DB for testing
        return this.httpclint.get<UserProfileResult>('assets/db/profile.json');
    }

    updateProfile(profileData: ProfileData): Observable<UserProfileResult> {
        return this.httpclint.put<UserProfileResult>(api_routes.updateProfile, profileData);
    }
}

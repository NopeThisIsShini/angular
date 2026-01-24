import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { smtpSettingsPayload } from '@app/pages/models';

@Injectable({
    providedIn: 'root'
})
export class SettingService {
    constructor(private http: HttpClient) {}
    getEmailSettings() {
        // API Call - uncomment for production
        // return this.http.get('get_email_setting');
        // Local DB for testing
        return this.http.get('assets/db/email-settings.json');
    }

    updateEmailSettings(settings: smtpSettingsPayload) {
        return this.http.post('save_email_setting', settings);
    }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmailSettings, EmailSettingsResponse, EmailSettingsResult } from '@app/pages/models';
import { api_routes } from '@app/utils/routes';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SmtpService {
    constructor(private httpClint: HttpClient) {}

    getMyEmailSettings(): Observable<EmailSettingsResult> {
        return this.httpClint.get<EmailSettingsResult>(api_routes.getMyEmailSettings);
    }

    updateAllSettings(payload: EmailSettingsResponse): Observable<EmailSettings> {
        return this.httpClint.put<EmailSettings>(api_routes.updateAllSettings, payload);
    }
}

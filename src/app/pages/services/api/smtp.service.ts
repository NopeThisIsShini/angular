import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmailSettings, EmailSettingsResponse, EmailSettingsResult } from '@/app/pages/models';
import { api_routes } from '@/app/utils/routes';
import { IS_LOCAL_API } from '@/app/utils/interceptor/base-url.interceptor';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SmtpService {
    constructor(private httpClint: HttpClient) { }

    getMyEmailSettings(): Observable<EmailSettingsResult> {
        // API Call - uncomment for production
        // return this.httpClint.get<EmailSettingsResult>(api_routes.getMyEmailSettings);
        // Local DB for testing
        return this.httpClint.get<EmailSettingsResult>(api_routes.smtpLocal, {
            context: new HttpContext().set(IS_LOCAL_API, true)
        });
    }

    updateAllSettings(payload: EmailSettingsResponse): Observable<EmailSettings> {
        return this.httpClint.put<EmailSettings>(api_routes.updateAllSettings, payload);
    }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageUploadResponse } from '../../models/api/common.model';

@Injectable({
    providedIn: 'root'
})
export class CommonService {
    constructor(private http: HttpClient) {}

    uploadImage(file: File): Observable<ImageUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ImageUploadResponse>('api/services/app/TyreService/UploadImage', formData);
    }
}

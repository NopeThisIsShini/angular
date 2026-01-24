import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModel } from '@app/shared/models';
import {
    Edition,
    CreateEditionInput,
    UpdateEditionInput,
    GetAllEditionsResponse,
    EditionResponse
} from '@app/pages/models';
import { api_routes } from '@app/utils/routes';

@Injectable({
    providedIn: 'root'
})
export class EditionService {
    constructor(private http: HttpClient) {}

    getAll(): Observable<GetAllEditionsResponse> {
        // DEMO: Using static JSON instead of API call
        // Original API call:
        // return this.http.get<GetAllEditionsResponse>(api_routes.getAllEditions);
        return this.http.get<GetAllEditionsResponse>('assets/db/editions.json');
    }

    create(input: CreateEditionInput): Observable<EditionResponse> {
        // return this.http.post<EditionResponse>(api_routes.createEdition, input);
        // DEMO: Return mock response
        return this.http.get<EditionResponse>('assets/db/editions.json');
    }

    update(input: UpdateEditionInput): Observable<EditionResponse> {
        // return this.http.put<EditionResponse>(api_routes.updateEdition, input);
        // DEMO: Return mock response
        return this.http.get<EditionResponse>('assets/db/editions.json');
    }

    delete(id: number): Observable<CommonModel> {
        // const params = new HttpParams().set('id', id.toString());
        // return this.http.delete<CommonModel>(api_routes.deleteEdition, { params });
        // DEMO: Return mock response
        return this.http.get<CommonModel>('assets/db/editions.json');
    }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModel, inputParamModel } from '@app/shared/models';
import { EditionModel, GetAllEditionsResponse, GetEditionByIdResponse, CreateOrUpdateEditionInput } from '@app/pages/models';

@Injectable({
    providedIn: 'root'
})
export class EditionService {
    private readonly baseUrl = 'api/services/app/Edition';

    constructor(private http: HttpClient) {}

    getAllEditions(input: inputParamModel): Observable<GetAllEditionsResponse> {
        // API Call - uncomment for production
        // let params = new HttpParams();
        // if (input.Keyword) {
        //     params = params.set('Keyword', input.Keyword);
        // }
        // if (input.MaxResultCount) {
        //     params = params.set('MaxResultCount', input.MaxResultCount);
        // }
        // if (input.SkipCount) {
        //     params = params.set('SkipCount', input.SkipCount);
        // }
        // return this.http.get<GetAllEditionsResponse>(`${this.baseUrl}/GetAll`, {
        //     params
        // });

        // Local DB for testing
        return this.http.get<GetAllEditionsResponse>('assets/db/editions.json');
    }

    getEditionById(id: number): Observable<GetEditionByIdResponse> {
        // API Call - uncomment for production
        // const params = new HttpParams().set('id', id);
        // return this.http.get<GetEditionByIdResponse>(`${this.baseUrl}/Get`, {
        //     params
        // });

        // Local DB for testing - returns mock data
        return this.http.get<GetEditionByIdResponse>('assets/db/editions.json');
    }

    createEdition(editionData: CreateOrUpdateEditionInput): Observable<CommonModel> {
        return this.http.post<CommonModel>(`${this.baseUrl}/Create`, editionData);
    }

    updateEdition(editionData: CreateOrUpdateEditionInput): Observable<CommonModel> {
        return this.http.put<CommonModel>(`${this.baseUrl}/Update`, editionData);
    }

    saveEdition(editionData: CreateOrUpdateEditionInput, isUpdate: boolean): Observable<CommonModel> {
        return isUpdate ? this.updateEdition(editionData) : this.createEdition(editionData);
    }

    deleteEdition(id: number): Observable<CommonModel> {
        const params = new HttpParams().set('id', id);
        return this.http.delete<CommonModel>(`${this.baseUrl}/Delete`, {
            params
        });
    }
}

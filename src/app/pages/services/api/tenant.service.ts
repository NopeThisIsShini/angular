import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModel, inputParamModel } from '@app/shared/models';
import {
    TenantModel,
    GetAllTenantsResponse,
    GetTenantByIdResponse,
    CreateTenantInput,
    UpdateTenantInput
} from '@app/pages/models';

@Injectable({
    providedIn: 'root'
})
export class TenantService {
    private readonly baseUrl = 'api/services/app/Tenant';

    constructor(private http: HttpClient) {}

    getAllTenants(input: inputParamModel): Observable<GetAllTenantsResponse> {
        // API Call - uncomment for production
        // let params = new HttpParams();
        // if (input.SearchTerm) {
        //     params = params.set('SearchTerm', input.SearchTerm);
        // }
        // if (input.MaxResultCount) {
        //     params = params.set('MaxResultCount', input.MaxResultCount);
        // }
        // if (input.SkipCount) {
        //     params = params.set('SkipCount', input.SkipCount);
        // }
        // return this.http.get<GetAllTenantsResponse>(`${this.baseUrl}/GetAll`, {
        //     params
        // });

        // Local DB for testing
        return this.http.get<GetAllTenantsResponse>('assets/db/tenants.json');
    }

    getTenantById(id: number): Observable<GetTenantByIdResponse> {
        // API Call - uncomment for production
        // const params = new HttpParams().set('id', id);
        // return this.http.get<GetTenantByIdResponse>(`${this.baseUrl}/Get`, {
        //     params
        // });

        // Local DB for testing - returns mock data
        return this.http.get<GetTenantByIdResponse>('assets/db/tenants.json');
    }

    createTenant(tenantData: CreateTenantInput): Observable<CommonModel> {
        return this.http.post<CommonModel>(`${this.baseUrl}/Create`, tenantData);
    }

    updateTenant(tenantData: UpdateTenantInput): Observable<CommonModel> {
        return this.http.put<CommonModel>(`${this.baseUrl}/Update`, tenantData);
    }

    saveTenant(tenantData: CreateTenantInput | UpdateTenantInput, isUpdate: boolean): Observable<CommonModel> {
        return isUpdate
            ? this.updateTenant(tenantData as UpdateTenantInput)
            : this.createTenant(tenantData as CreateTenantInput);
    }

    deleteTenant(id: number): Observable<CommonModel> {
        const params = new HttpParams().set('id', id);
        return this.http.delete<CommonModel>(`${this.baseUrl}/Delete`, {
            params
        });
    }
}

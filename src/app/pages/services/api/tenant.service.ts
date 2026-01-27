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
    private readonly baseUrl = 'admin/tenants';

    constructor(private http: HttpClient) {}

    getAllTenants(input: inputParamModel): Observable<GetAllTenantsResponse> {
        let params = new HttpParams();
        if (input.keyword) {
            params = params.set('keyword', input.keyword);
        }
        if (input.maxResultCount) {
            params = params.set('maxResultCount', input.maxResultCount.toString());
        }
        if (input.skipCount) {
            params = params.set('skipCount', input.skipCount.toString());
        }
        return this.http.get<GetAllTenantsResponse>(this.baseUrl, { params });
    }

    getTenantById(id: number): Observable<GetTenantByIdResponse> {
        return this.http.get<GetTenantByIdResponse>(`${this.baseUrl}/${id}`);
    }

    createTenant(tenantData: CreateTenantInput): Observable<CommonModel> {
        return this.http.post<CommonModel>(this.baseUrl, tenantData);
    }

    updateTenant(tenantData: UpdateTenantInput): Observable<CommonModel> {
        return this.http.put<CommonModel>(`${this.baseUrl}/${tenantData.id}`, tenantData);
    }

    saveTenant(tenantData: CreateTenantInput | UpdateTenantInput, isUpdate: boolean): Observable<CommonModel> {
        return isUpdate
            ? this.updateTenant(tenantData as UpdateTenantInput)
            : this.createTenant(tenantData as CreateTenantInput);
    }

    deleteTenant(id: number): Observable<CommonModel> {
        return this.http.delete<CommonModel>(`${this.baseUrl}/${id}`);
    }
}

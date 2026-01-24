import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModel, inputParamModel } from '@app/shared/models';
import {
    Tenant,
    CreateTenantInput,
    UpdateTenantInput,
    GetAllTenantsResponse,
    TenantResponse,
    ImpersonationResponse
} from '@app/pages/models';
import { api_routes } from '@app/utils/routes';

@Injectable({
    providedIn: 'root'
})
export class TenantService {
    constructor(private http: HttpClient) {}

    getAll(input: inputParamModel): Observable<GetAllTenantsResponse> {
        // DEMO: Using static JSON instead of API call
        // Original API call:
        // let params = new HttpParams();
        // if (input.SearchTerm) {
        //     params = params.set('Keyword', input.SearchTerm);
        // }
        // if (input.MaxResultCount) {
        //     params = params.set('MaxResultCount', input.MaxResultCount);
        // }
        // if (input.SkipCount) {
        //     params = params.set('SkipCount', input.SkipCount);
        // }
        // return this.http.get<GetAllTenantsResponse>(api_routes.getAllTenants, { params });
        return this.http.get<GetAllTenantsResponse>('assets/db/tenants.json');
    }

    getById(id: number): Observable<TenantResponse> {
        // DEMO: Using static JSON - in real app would use API
        // const params = new HttpParams().set('id', id.toString());
        // return this.http.get<TenantResponse>(api_routes.getTenantById, { params });
        return this.http.get<TenantResponse>('assets/db/tenants.json');
    }

    create(input: CreateTenantInput): Observable<TenantResponse> {
        // return this.http.post<TenantResponse>(api_routes.createTenant, input);
        // DEMO: Return mock response
        return this.http.get<TenantResponse>('assets/db/tenants.json');
    }

    update(input: UpdateTenantInput): Observable<TenantResponse> {
        // return this.http.put<TenantResponse>(api_routes.updateTenant, input);
        // DEMO: Return mock response
        return this.http.get<TenantResponse>('assets/db/tenants.json');
    }

    delete(id: number): Observable<CommonModel> {
        // const params = new HttpParams().set('id', id.toString());
        // return this.http.delete<CommonModel>(api_routes.deleteTenant, { params });
        // DEMO: Return mock response
        return this.http.get<CommonModel>('assets/db/tenants.json');
    }

    activate(id: number): Observable<CommonModel> {
        // return this.http.post<CommonModel>(api_routes.activateTenant, { id });
        return this.http.get<CommonModel>('assets/db/tenants.json');
    }

    deactivate(id: number): Observable<CommonModel> {
        // return this.http.post<CommonModel>(api_routes.deactivateTenant, { id });
        return this.http.get<CommonModel>('assets/db/tenants.json');
    }

    impersonate(tenantId: number, userId: number): Observable<ImpersonationResponse> {
        // return this.http.post<ImpersonationResponse>(api_routes.impersonate, { tenantId, userId });
        return this.http.get<ImpersonationResponse>('assets/db/tenants.json');
    }
}

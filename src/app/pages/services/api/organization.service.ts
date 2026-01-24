import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CommonModel, inputParamModel } from '@app/shared/models';
import {
    OrganizationUnit,
    OrganizationUnitTree,
    CreateOrganizationUnitInput,
    UpdateOrganizationUnitInput,
    MoveOrganizationUnitInput,
    GetAllOrganizationUnitsResponse,
    GetOrganizationUnitTreeResponse,
    OrganizationUnitResponse,
    GetOrganizationUnitUsersResponse
} from '@app/pages/models';
import { api_routes } from '@app/utils/routes';
import { OUScopingService } from '@app/shared/services/ou-scoping.service';

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {
    constructor(
        private http: HttpClient,
        private ouScopingService: OUScopingService
    ) {}

    getAll(input: inputParamModel): Observable<GetAllOrganizationUnitsResponse> {
        // DEMO: Using static JSON instead of API call
        return this.http.get<GetAllOrganizationUnitsResponse>('assets/db/organization-units.json');
    }

    getTree(parentId?: number | null): Observable<GetOrganizationUnitTreeResponse> {
        // DEMO: Using static JSON instead of API call
        return this.http.get<GetOrganizationUnitTreeResponse>('assets/db/organization-tree.json');
    }

    getById(id: number): Observable<OrganizationUnitResponse> {
        // const params = new HttpParams().set('id', id.toString());
        // return this.http.get<OrganizationUnitResponse>(api_routes.getOrganizationUnitById, { params });
        return this.http.get<OrganizationUnitResponse>('assets/db/organization-units.json');
    }

    create(input: CreateOrganizationUnitInput): Observable<OrganizationUnitResponse> {
        // return this.http.post<OrganizationUnitResponse>(api_routes.createOrganizationUnit, input);
        // DEMO: Return mock response
        return this.http.get<OrganizationUnitResponse>('assets/db/organization-units.json');
    }

    update(input: UpdateOrganizationUnitInput): Observable<OrganizationUnitResponse> {
        // return this.http.put<OrganizationUnitResponse>(api_routes.updateOrganizationUnit, input);
        // DEMO: Return mock response
        return this.http.get<OrganizationUnitResponse>('assets/db/organization-units.json');
    }

    delete(id: number): Observable<CommonModel> {
        // const params = new HttpParams().set('id', id.toString());
        // return this.http.delete<CommonModel>(api_routes.deleteOrganizationUnit, { params });
        // DEMO: Return mock response
        return this.http.get<CommonModel>('assets/db/organization-units.json');
    }

    move(input: MoveOrganizationUnitInput): Observable<OrganizationUnitResponse> {
        // return this.http.put<OrganizationUnitResponse>(api_routes.moveOrganizationUnit, input);
        // DEMO: Return mock response
        return this.http.get<OrganizationUnitResponse>('assets/db/organization-units.json');
    }

    getUsers(organizationUnitId: number): Observable<GetOrganizationUnitUsersResponse> {
        // const params = new HttpParams().set('id', organizationUnitId.toString());
        // return this.http.get<GetOrganizationUnitUsersResponse>(api_routes.getOrganizationUnitUsers, { params });
        return this.http.get<GetOrganizationUnitUsersResponse>('assets/db/organization-users.json');
    }

    addUser(organizationUnitId: number, userId: number): Observable<CommonModel> {
        // return this.http.post<CommonModel>(api_routes.assignUserToOrganizationUnit, { organizationUnitId, userId });
        return this.http.get<CommonModel>('assets/db/organization-units.json');
    }

    removeUser(organizationUnitId: number, userId: number): Observable<CommonModel> {
        // return this.http.delete<CommonModel>(api_routes.removeUserFromOrganizationUnit, {
        //     body: { organizationUnitId, userId }
        // });
        return this.http.get<CommonModel>('assets/db/organization-units.json');
    }
}


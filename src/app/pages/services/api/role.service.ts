import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CommonModel, inputParamModel } from '@app/shared/models';
import { GetAllRolesOutputModel, roleResponse, RolesModel } from '@app/pages/models';
import { OUScopingService } from '@app/shared/services/ou-scoping.service';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    constructor(
        private http: HttpClient,
        private ouScopingService: OUScopingService
    ) {}

    getallRoles(input: inputParamModel): Observable<GetAllRolesOutputModel> {
        // DEMO: Using static JSON instead of API call
        return this.http.get<GetAllRolesOutputModel>('assets/db/roles.json');
    }
    saveRole(roleData: RolesModel, isUpdate: boolean): Observable<roleResponse> {
        const url = isUpdate ? 'api/services/app/Role/Update' : 'api/services/app/Role/Create';

        return isUpdate ? this.http.put<roleResponse>(url, roleData) : this.http.post<roleResponse>(url, roleData);
    }

    deleteRoleByid(id: number): Observable<CommonModel> {
        let params = new HttpParams().set('id', id);
        return this.http.delete<CommonModel>(`api/services/app/Role/Delete`, {
            params
        });
    }
}


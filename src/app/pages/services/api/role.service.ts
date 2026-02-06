import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModel, inputParamModel } from '@/app/shared/models';
import { GetAllRolesOutputModel, roleResponse, RolesModel } from '@/app/pages/models';
import { api_routes } from '@/app/utils/routes';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    constructor(private http: HttpClient) { }

    getallRoles(input: inputParamModel) {
        let params = new HttpParams();
        if (input.keyword) {
            params = params.set('keyword', input.keyword);
        }
        if (input.maxResultCount) {
            params = params.set('maxResultCount', input.maxResultCount);
        }
        if (input.skipCount) {
            params = params.set('skipCount', input.skipCount);
        }
        return this.http.get<GetAllRolesOutputModel>(api_routes.getallRoles, {
            params
        });
    }
    saveRole(roleData: RolesModel, isUpdate: boolean): Observable<roleResponse> {
        const url = api_routes.getallRoles;

        return isUpdate ? this.http.put<roleResponse>(url, roleData) : this.http.post<roleResponse>(url, roleData);
    }

    deleteRoleByid(id: number): Observable<CommonModel> {
        let params = new HttpParams().set('id', id);
        return this.http.delete<CommonModel>(`api/services/app/Role/Delete`, {
            params
        });
    }
}

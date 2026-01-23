import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetAllRolesOutputModel, getUserResponse, userInputParamModel, UsersModel } from '@app/pages/models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    constructor(private http: HttpClient) {}

    getRoles(): Observable<GetAllRolesOutputModel> {
        // DEMO: Using static JSON instead of API call
        // Original API call:
        // return this.http.get<GetAllRolesOutputModel>(`api/services/app/User/GetRoles`);
        return this.http.get<GetAllRolesOutputModel>('assets/db/roles.json');
    }

    getallusers(input: userInputParamModel): Observable<getUserResponse> {
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
        // return this.http.get<getUserResponse>(`api/services/app/User/GetAll`, {
        //     params
        // });
        return this.http.get<getUserResponse>('assets/db/users.json');
    }

    saveUser(input: UsersModel, isEdit: boolean) {
        if (isEdit) {
            return this.http.put<UsersModel>(`api/services/app/User/Update`, input);
        } else {
            return this.http.post<UsersModel>(`api/services/app/User/Create`, input);
        }
    }
}

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
        // API Call - uncomment for production
        return this.http.get<GetAllRolesOutputModel>(`role/roles`);
        // Local DB for testing
        // return this.http.get<GetAllRolesOutputModel>('assets/db/roles.json');
    }

    getallusers(input: userInputParamModel): Observable<getUserResponse> {
        // API Call - uncomment for production
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
        return this.http.get<getUserResponse>(`user/users`, { params });
        // Local DB for testing
        // return this.http.get<getUserResponse>('assets/db/users.json');
    }

    saveUser(input: UsersModel, isEdit: boolean) {
        if (isEdit) {
            return this.http.patch<UsersModel>(`user/users`, input);
        } else {
            return this.http.post<UsersModel>(`user/users`, input);
        }
    }
}

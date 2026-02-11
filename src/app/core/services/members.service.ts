import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    MemberResponse,
    MemberRole,
    AddMembersRequest,
    UpdateMemberRoleRequest,
    SuccessResponse
} from '@models/api.model';

export interface MembersListParams {
    role?: MemberRole;
    search?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MembersService {
    private api = inject(ApiService);

    list(orgId: string, params?: MembersListParams): Observable<MemberResponse[]> {
        return this.api.get<MemberResponse[]>(`/organizations/${orgId}/members/`, params);
    }

    add(orgId: string, request: AddMembersRequest): Observable<MemberResponse[]> {
        return this.api.post<MemberResponse[]>(`/organizations/${orgId}/members/`, request);
    }

    updateRole(orgId: string, userId: string, request: UpdateMemberRoleRequest): Observable<MemberResponse> {
        return this.api.patch<MemberResponse>(`/organizations/${orgId}/members/${userId}`, request);
    }

    remove(orgId: string, userId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/members/${userId}`);
    }
}

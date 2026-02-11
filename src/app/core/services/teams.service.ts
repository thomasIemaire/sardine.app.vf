import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    TeamResponse,
    TeamCreateRequest,
    TeamUpdateRequest,
    TeamAddMembersRequest,
    SuccessResponse
} from '@models/api.model';

export interface TeamsListParams {
    search?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TeamsService {
    private api = inject(ApiService);

    list(orgId: string, params?: TeamsListParams): Observable<TeamResponse[]> {
        return this.api.get<TeamResponse[]>(`/organizations/${orgId}/teams/`, params);
    }

    get(orgId: string, teamId: string): Observable<TeamResponse> {
        return this.api.get<TeamResponse>(`/organizations/${orgId}/teams/${teamId}`);
    }

    create(orgId: string, request: TeamCreateRequest): Observable<TeamResponse> {
        return this.api.post<TeamResponse>(`/organizations/${orgId}/teams/`, request);
    }

    update(orgId: string, teamId: string, request: TeamUpdateRequest): Observable<TeamResponse> {
        return this.api.patch<TeamResponse>(`/organizations/${orgId}/teams/${teamId}`, request);
    }

    delete(orgId: string, teamId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/teams/${teamId}`);
    }

    addMembers(orgId: string, teamId: string, request: TeamAddMembersRequest): Observable<TeamResponse> {
        return this.api.post<TeamResponse>(`/organizations/${orgId}/teams/${teamId}/members`, request);
    }

    removeMember(orgId: string, teamId: string, userId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/teams/${teamId}/members/${userId}`);
    }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    OrganizationResponse,
    OrganizationCreateRequest,
    OrganizationUpdateRequest,
    SuccessResponse
} from '@models/api.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsService {
    private api = inject(ApiService);

    list(): Observable<OrganizationResponse[]> {
        return this.api.get<OrganizationResponse[]>('/organizations/');
    }

    get(orgId: string): Observable<OrganizationResponse> {
        return this.api.get<OrganizationResponse>(`/organizations/${orgId}`);
    }

    create(request: OrganizationCreateRequest): Observable<OrganizationResponse> {
        return this.api.post<OrganizationResponse>('/organizations/', request);
    }

    update(orgId: string, request: OrganizationUpdateRequest): Observable<OrganizationResponse> {
        return this.api.patch<OrganizationResponse>(`/organizations/${orgId}`, request);
    }

    delete(orgId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}`);
    }

    getChildren(orgId: string): Observable<OrganizationResponse[]> {
        return this.api.get<OrganizationResponse[]>(`/organizations/${orgId}/children`);
    }
}

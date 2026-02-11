import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    AgentResponse,
    AgentStatus,
    AgentCreateRequest,
    AgentUpdateRequest,
    SuccessResponse
} from '@models/api.model';

export interface AgentsListParams {
    status?: AgentStatus;
    search?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AgentsService {
    private api = inject(ApiService);

    list(orgId: string, params?: AgentsListParams): Observable<AgentResponse[]> {
        return this.api.get<AgentResponse[]>(`/organizations/${orgId}/agents/`, params);
    }

    get(orgId: string, agentId: string): Observable<AgentResponse> {
        return this.api.get<AgentResponse>(`/organizations/${orgId}/agents/${agentId}`);
    }

    create(orgId: string, request: AgentCreateRequest): Observable<AgentResponse> {
        return this.api.post<AgentResponse>(`/organizations/${orgId}/agents/`, request);
    }

    update(orgId: string, agentId: string, request: AgentUpdateRequest): Observable<AgentResponse> {
        return this.api.patch<AgentResponse>(`/organizations/${orgId}/agents/${agentId}`, request);
    }

    delete(orgId: string, agentId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/agents/${agentId}`);
    }

    toggleStatus(orgId: string, agentId: string): Observable<AgentResponse> {
        return this.api.post<AgentResponse>(`/organizations/${orgId}/agents/${agentId}/toggle-status`);
    }
}

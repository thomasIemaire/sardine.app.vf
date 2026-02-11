import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    FlowResponse,
    FlowStatus,
    FlowCreateRequest,
    FlowUpdateRequest,
    FlowImportRequest,
    FlowExportResponse,
    FlowExecuteRequest,
    FlowExecutionResponse,
    SuccessResponse
} from '@models/api.model';

export interface FlowsListParams {
    status?: FlowStatus;
    search?: string;
    is_template?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class FlowsService {
    private api = inject(ApiService);

    list(orgId: string, params?: FlowsListParams): Observable<FlowResponse[]> {
        return this.api.get<FlowResponse[]>(`/organizations/${orgId}/flows/`, params);
    }

    get(orgId: string, flowId: string): Observable<FlowResponse> {
        return this.api.get<FlowResponse>(`/organizations/${orgId}/flows/${flowId}`);
    }

    create(orgId: string, request: FlowCreateRequest): Observable<FlowResponse> {
        return this.api.post<FlowResponse>(`/organizations/${orgId}/flows/`, request);
    }

    update(orgId: string, flowId: string, request: FlowUpdateRequest): Observable<FlowResponse> {
        return this.api.patch<FlowResponse>(`/organizations/${orgId}/flows/${flowId}`, request);
    }

    delete(orgId: string, flowId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/flows/${flowId}`);
    }

    toggleStatus(orgId: string, flowId: string): Observable<FlowResponse> {
        return this.api.post<FlowResponse>(`/organizations/${orgId}/flows/${flowId}/toggle-status`);
    }

    execute(orgId: string, flowId: string, request?: FlowExecuteRequest): Observable<FlowExecutionResponse> {
        return this.api.post<FlowExecutionResponse>(`/organizations/${orgId}/flows/${flowId}/execute`, request || {});
    }

    getExecutions(orgId: string, flowId: string): Observable<FlowExecutionResponse[]> {
        return this.api.get<FlowExecutionResponse[]>(`/organizations/${orgId}/flows/${flowId}/executions`);
    }

    export(orgId: string, flowId: string): Observable<FlowExportResponse> {
        return this.api.post<FlowExportResponse>(`/organizations/${orgId}/flows/${flowId}/export`);
    }

    import(orgId: string, request: FlowImportRequest): Observable<FlowResponse> {
        return this.api.post<FlowResponse>(`/organizations/${orgId}/flows/import`, request);
    }
}

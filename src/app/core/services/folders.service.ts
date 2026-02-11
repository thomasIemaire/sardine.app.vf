import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    FolderResponse,
    FolderContentsResponse,
    FolderCreateRequest,
    FolderRenameRequest,
    FolderMoveRequest,
    SuccessResponse
} from '@models/api.model';

@Injectable({
    providedIn: 'root'
})
export class FoldersService {
    private api = inject(ApiService);

    listRoot(orgId: string): Observable<FolderResponse[]> {
        return this.api.get<FolderResponse[]>(`/organizations/${orgId}/folders/`);
    }

    getContents(orgId: string, folderId: string): Observable<FolderContentsResponse> {
        return this.api.get<FolderContentsResponse>(`/organizations/${orgId}/folders/${folderId}`);
    }

    create(orgId: string, request: FolderCreateRequest): Observable<FolderResponse> {
        return this.api.post<FolderResponse>(`/organizations/${orgId}/folders/`, request);
    }

    rename(orgId: string, folderId: string, request: FolderRenameRequest): Observable<FolderResponse> {
        return this.api.patch<FolderResponse>(`/organizations/${orgId}/folders/${folderId}`, request);
    }

    move(orgId: string, folderId: string, request: FolderMoveRequest): Observable<FolderResponse> {
        return this.api.post<FolderResponse>(`/organizations/${orgId}/folders/${folderId}/move`, request);
    }

    delete(orgId: string, folderId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/folders/${folderId}`);
    }

    getBreadcrumbs(orgId: string, folderId: string): Observable<FolderResponse[]> {
        return this.api.get<FolderResponse[]>(`/organizations/${orgId}/folders/${folderId}/breadcrumbs`);
    }
}

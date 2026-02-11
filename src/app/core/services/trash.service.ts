import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    TrashResponse,
    FolderResponse,
    FileResponse,
    EmptyTrashResponse,
    SuccessResponse
} from '@models/api.model';

@Injectable({
    providedIn: 'root'
})
export class TrashService {
    private api = inject(ApiService);

    get(orgId: string): Observable<TrashResponse> {
        return this.api.get<TrashResponse>(`/organizations/${orgId}/trash/`);
    }

    restoreFolder(orgId: string, folderId: string): Observable<FolderResponse> {
        return this.api.post<FolderResponse>(`/organizations/${orgId}/trash/folders/${folderId}/restore`);
    }

    restoreFile(orgId: string, fileId: string): Observable<FileResponse> {
        return this.api.post<FileResponse>(`/organizations/${orgId}/trash/files/${fileId}/restore`);
    }

    deleteFolderPermanently(orgId: string, folderId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/trash/folders/${folderId}`);
    }

    deleteFilePermanently(orgId: string, fileId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/trash/files/${fileId}`);
    }

    empty(orgId: string): Observable<EmptyTrashResponse> {
        return this.api.delete<EmptyTrashResponse>(`/organizations/${orgId}/trash/empty`);
    }
}

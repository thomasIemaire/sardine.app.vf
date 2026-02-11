import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    FileResponse,
    FileRenameRequest,
    FileMoveRequest,
    SuccessResponse
} from '@models/api.model';
import { ImportFileEntry } from '@shared/dialogs';

@Injectable({
    providedIn: 'root'
})
export class FilesService {
    private api = inject(ApiService);

    get(orgId: string, fileId: string): Observable<FileResponse> {
        return this.api.get<FileResponse>(`/organizations/${orgId}/files/${fileId}`);
    }

    upload(orgId: string, files: ImportFileEntry[], folderId?: string): Observable<FileResponse[]> {
        return this.api.post<FileResponse[]>(`/organizations/${orgId}/files/upload`, {
            files: files.map(f => ({
                name: f.name,
                size: f.size,
                mime_type: f.mime_type,
                base64: f.base64
            })),
            folder_id: folderId ?? null
        });
    }

    download(orgId: string, fileId: string): Observable<Blob> {
        return this.api.download(`/organizations/${orgId}/files/${fileId}/download`);
    }

    rename(orgId: string, fileId: string, request: FileRenameRequest): Observable<FileResponse> {
        return this.api.patch<FileResponse>(`/organizations/${orgId}/files/${fileId}`, request);
    }

    move(orgId: string, fileId: string, request: FileMoveRequest): Observable<FileResponse> {
        return this.api.post<FileResponse>(`/organizations/${orgId}/files/${fileId}/move`, request);
    }

    delete(orgId: string, fileId: string): Observable<SuccessResponse> {
        return this.api.delete<SuccessResponse>(`/organizations/${orgId}/files/${fileId}`);
    }
}

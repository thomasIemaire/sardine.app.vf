import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateFolderRequest,
  FolderContentResponse,
  FolderPermissionInfo,
  FolderResponse,
  MoveFolderRequest,
  RenameFolderRequest,
  ShareFolderRequest,
  TrashItemResponse
} from '../../models';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class FoldersService {
  private readonly http = inject(HttpService);

  /**
   * US-B2: Get folder content (subfolders + document references + breadcrumb)
   */
  getFolderContent(folderId: string): Observable<FolderContentResponse> {
    return this.http.get<FolderContentResponse>(`/folders/${folderId}`);
  }

  /**
   * Get root folder of a space
   */
  getRootFolder(spaceId: string): Observable<FolderResponse> {
    return this.http.get<FolderResponse>(`/folders/space/${spaceId}/root`);
  }

  /**
   * US-C1: Create a new folder
   */
  createFolder(spaceId: string, data: CreateFolderRequest): Observable<FolderResponse> {
    return this.http.post<FolderResponse>(`/folders?spaceId=${spaceId}`, data);
  }

  /**
   * US-C2: Rename folder
   */
  renameFolder(folderId: string, data: RenameFolderRequest): Observable<FolderResponse> {
    return this.http.patch<FolderResponse>(`/folders/${folderId}`, data);
  }

  /**
   * US-C3: Move folder to another parent
   */
  moveFolder(folderId: string, data: MoveFolderRequest): Observable<FolderResponse> {
    return this.http.post<FolderResponse>(`/folders/${folderId}/move`, data);
  }

  /**
   * US-C4: Soft delete folder (goes to trash)
   */
  deleteFolder(folderId: string): Observable<void> {
    return this.http.delete<void>(`/folders/${folderId}`);
  }

  /**
   * US-C5: Restore folder from trash
   */
  restoreFolder(folderId: string): Observable<FolderResponse> {
    return this.http.post<FolderResponse>(`/folders/${folderId}/restore`, {});
  }

  /**
   * US-C6: Permanently delete folder from trash
   */
  purgeFolder(folderId: string): Observable<void> {
    return this.http.delete<void>(`/folders/${folderId}/purge`);
  }

  // --- Permissions ---

  /**
   * US-E1: Add permission to folder
   */
  addPermission(folderId: string, data: ShareFolderRequest): Observable<FolderPermissionInfo> {
    return this.http.post<FolderPermissionInfo>(`/folders/${folderId}/permissions`, data);
  }

  /**
   * US-E3: Get folder permissions
   */
  getPermissions(folderId: string): Observable<FolderPermissionInfo[]> {
    return this.http.get<FolderPermissionInfo[]>(`/folders/${folderId}/permissions`);
  }

  /**
   * US-E4: Remove folder permission
   */
  removePermission(folderId: string, permissionId: string): Observable<void> {
    return this.http.delete<void>(`/folders/${folderId}/permissions/${permissionId}`);
  }

  // --- Trash ---

  /**
   * Get trash items for a space
   */
  getTrash(spaceId: string): Observable<TrashItemResponse[]> {
    return this.http.get<TrashItemResponse[]>(`/folders/space/${spaceId}/trash`);
  }

  /**
   * US-C6: Empty trash for a space
   */
  emptyTrash(spaceId: string): Observable<void> {
    return this.http.delete<void>(`/folders/space/${spaceId}/trash`);
  }
}

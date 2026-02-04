import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AddReferenceRequest,
  CloneReferencesRequest,
  DocumentDetailResponse,
  DocumentPermissionInfo,
  DocumentResponse,
  ImportDocumentRequest,
  MoveReferenceRequest,
  ReferenceResponse,
  ReplaceContentRequest,
  SearchResultItem,
  ShareDocumentRequest,
  UpdateDocumentRequest
} from '../../models';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly http = inject(HttpService);

  // --- Documents ---

  /**
   * US-D1: Import a new document (creates document + reference in folder)
   */
  importDocument(data: ImportDocumentRequest): Observable<DocumentResponse> {
    return this.http.post<DocumentResponse>('/documents', data);
  }

  /**
   * US-D5: Get document details with references
   */
  getDocument(documentId: string): Observable<DocumentDetailResponse> {
    return this.http.get<DocumentDetailResponse>(`/documents/${documentId}`);
  }

  /**
   * US-D5: Download document with content
   */
  downloadDocument(documentId: string): Observable<DocumentDetailResponse> {
    return this.http.get<DocumentDetailResponse>(`/documents/${documentId}/download`);
  }

  /**
   * US-D6: Update document metadata
   */
  updateDocument(documentId: string, data: UpdateDocumentRequest): Observable<DocumentDetailResponse> {
    return this.http.patch<DocumentDetailResponse>(`/documents/${documentId}`, data);
  }

  /**
   * US-D7: Replace document content
   */
  replaceContent(documentId: string, data: ReplaceContentRequest): Observable<DocumentDetailResponse> {
    return this.http.put<DocumentDetailResponse>(`/documents/${documentId}/content`, data);
  }

  /**
   * US-B3: Search documents by name, type, or tags
   */
  searchDocuments(query: string, spaceId?: string): Observable<SearchResultItem[]> {
    const params = spaceId ? `&spaceId=${spaceId}` : '';
    return this.http.get<SearchResultItem[]>(`/documents/search?q=${encodeURIComponent(query)}${params}`);
  }

  // --- References ---

  /**
   * US-D2: Add reference to existing document in folder
   */
  addReference(data: AddReferenceRequest): Observable<ReferenceResponse> {
    return this.http.post<ReferenceResponse>('/documents/references', data);
  }

  /**
   * US-D3: Move reference to another folder
   */
  moveReference(referenceId: string, data: MoveReferenceRequest): Observable<ReferenceResponse> {
    return this.http.post<ReferenceResponse>(`/documents/references/${referenceId}/move`, data);
  }

  /**
   * US-D4: Clone document references to multiple folders
   */
  cloneReferences(documentId: string, data: CloneReferencesRequest): Observable<ReferenceResponse[]> {
    return this.http.post<ReferenceResponse[]>(`/documents/${documentId}/clone`, data);
  }

  /**
   * US-D8: Move reference to trash
   */
  trashReference(referenceId: string): Observable<void> {
    return this.http.delete<void>(`/documents/references/${referenceId}`);
  }

  /**
   * US-D9: Restore reference from trash
   */
  restoreReference(referenceId: string): Observable<ReferenceResponse> {
    return this.http.post<ReferenceResponse>(`/documents/references/${referenceId}/restore`, {});
  }

  /**
   * Permanently delete reference from trash
   */
  purgeReference(referenceId: string): Observable<void> {
    return this.http.delete<void>(`/documents/references/${referenceId}/purge`);
  }

  // --- Permissions ---

  /**
   * US-E2: Add permission to document
   */
  addPermission(documentId: string, data: ShareDocumentRequest): Observable<DocumentPermissionInfo> {
    return this.http.post<DocumentPermissionInfo>(`/documents/${documentId}/permissions`, data);
  }

  /**
   * US-E3: Get document permissions
   */
  getPermissions(documentId: string): Observable<DocumentPermissionInfo[]> {
    return this.http.get<DocumentPermissionInfo[]>(`/documents/${documentId}/permissions`);
  }

  /**
   * US-E4: Remove document permission
   */
  removePermission(documentId: string, permissionId: string): Observable<void> {
    return this.http.delete<void>(`/documents/${documentId}/permissions/${permissionId}`);
  }
}

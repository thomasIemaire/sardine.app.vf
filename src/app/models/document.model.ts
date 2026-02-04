// Document Models - Based on API specification

import { AccessRole, PrincipalType } from './folder.model';

export interface DocumentListItem {
  _id: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
  tags: string[];
  createdAt?: string | null;
  referenceCount: number;
}

export interface DocumentResponse {
  _id: string;
  name: string;
  description?: string | null;
  mimeType?: string | null;
  size?: number | null;
  tags: string[];
  createdBy: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DocumentDetailResponse extends DocumentResponse {
  content?: string | null;
  references: ReferenceInfo[];
  permissions: DocumentPermissionInfo[];
}

export interface ReferenceInfo {
  _id: string;
  folderId: string;
  folderName?: string | null;
}

export interface ReferenceResponse {
  _id: string;
  documentId: string;
  folderId: string;
  folderName?: string | null;
  addedBy: string;
  addedAt?: string | null;
}

export interface DocumentPermissionInfo {
  _id: string;
  principalType: PrincipalType;
  principalId: string;
  principalName?: string | null;
  role: AccessRole;
}

export interface SearchResultItem {
  document: DocumentListItem;
  locations: ReferenceInfo[];
}

// Request models
export interface ImportDocumentRequest {
  name: string;
  folderId: string;
  mimeType?: string | null;
  size?: number | null;
  content?: string | null;
}

export interface UpdateDocumentRequest {
  name?: string | null;
  description?: string | null;
  tags?: string[] | null;
}

export interface ReplaceContentRequest {
  content: string;
  mimeType?: string | null;
  size?: number | null;
}

export interface AddReferenceRequest {
  documentId: string;
  folderId: string;
}

export interface MoveReferenceRequest {
  targetFolderId: string;
}

export interface CloneReferencesRequest {
  folderIds: string[];
}

export interface ShareDocumentRequest {
  principalType: PrincipalType;
  principalId: string;
  role: AccessRole;
}

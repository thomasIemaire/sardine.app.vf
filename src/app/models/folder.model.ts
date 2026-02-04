// Folder Models - Based on API specification

export type AccessRole = 'viewer' | 'editor' | 'owner';
export type PrincipalType = 'user' | 'team';

export interface FolderListItem {
  _id: string;
  name: string;
  parentId?: string | null;
  isRoot: boolean;
  subfolderCount: number;
  referenceCount: number;
  // UI helpers (computed from API data)
  color?: string;
}

export interface FolderResponse {
  _id: string;
  name: string;
  spaceId: string;
  parentId?: string | null;
  isRoot: boolean;
  createdBy: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface FolderBreadcrumb {
  id: string;
  name: string;
}

// Document reference as it appears in folder content
export interface DocumentReferenceInFolder {
  _id: string; // reference ID
  documentId: string;
  name: string;
  type?: string | null; // file type category
  mimeType?: string | null;
  size?: number | null;
  createdAt?: string | null;
}

export interface FolderContentResponse {
  folder: FolderResponse;
  breadcrumb: FolderBreadcrumb[];
  subfolders: FolderListItem[];
  documents: DocumentReferenceInFolder[];
}

export interface FolderPermissionInfo {
  _id: string;
  principalType: PrincipalType;
  principalId: string;
  principalName?: string | null;
  role: AccessRole;
  inherited: boolean;
}

export interface TrashItemResponse {
  _id: string;
  itemType: 'folder' | 'reference';
  itemId: string;
  itemName: string;
  originalParentId?: string | null;
  originalParentName?: string | null;
  spaceId: string;
  deletedBy: string;
  deletedAt?: string | null;
  expiresAt?: string | null;
}

export interface CreateFolderRequest {
  name: string;
  parentId?: string | null;
}

export interface RenameFolderRequest {
  name: string;
}

export interface MoveFolderRequest {
  targetParentId?: string | null;
}

export interface ShareFolderRequest {
  principalType: PrincipalType;
  principalId: string;
  role: AccessRole;
}

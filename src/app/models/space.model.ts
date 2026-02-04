// Space Models - Based on API specification

import { PrincipalType } from './folder.model';

export interface SpaceListItem {
  _id: string;
  name: string;
  principalType: PrincipalType;
  principalId: string;
  rootFolderId: string;
  isPersonal: boolean;
}

export interface SpaceResponse {
  _id: string;
  name: string;
  principalType: PrincipalType;
  principalId: string;
  rootFolderId: string;
  createdAt?: string | null;
}

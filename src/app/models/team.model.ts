// Team Models - Based on API specification

export type TeamRole = 'member' | 'admin';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface TeamListItem {
  _id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  myRole: TeamRole;
}

export interface TeamMemberInfo {
  userId: string;
  email: string;
  firstname: string;
  lastname: string;
  role: TeamRole;
  joinedAt?: string | null;
}

export interface TeamResponse {
  _id: string;
  name: string;
  description?: string | null;
  spaceId: string;
  createdBy: string;
  createdAt?: string | null;
  isArchived: boolean;
}

export interface TeamDetailResponse extends TeamResponse {
  members: TeamMemberInfo[];
}

export interface InvitationResponse {
  _id: string;
  teamId: string;
  teamName: string;
  email: string;
  role: TeamRole;
  status: InvitationStatus;
  invitedBy: string;
  invitedByName?: string | null;
  createdAt?: string | null;
  expiresAt?: string | null;
}

// Request models
export interface CreateTeamRequest {
  name: string;
  description?: string | null;
}

export interface UpdateTeamRequest {
  name?: string | null;
  description?: string | null;
}

export interface InviteMemberRequest {
  email: string;
  role?: TeamRole;
}

export interface ChangeMemberRoleRequest {
  role: TeamRole;
}

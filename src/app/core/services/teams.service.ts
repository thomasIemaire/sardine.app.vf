import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ChangeMemberRoleRequest,
  CreateTeamRequest,
  InvitationResponse,
  InviteMemberRequest,
  TeamDetailResponse,
  TeamListItem,
  TeamResponse,
  UpdateTeamRequest
} from '../../models';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private readonly http = inject(HttpService);

  // --- Teams ---

  /**
   * Get all teams where user is a member
   */
  listMyTeams(): Observable<TeamListItem[]> {
    return this.http.get<TeamListItem[]>('/teams');
  }

  /**
   * Get team details with members list
   */
  getTeam(teamId: string): Observable<TeamDetailResponse> {
    return this.http.get<TeamDetailResponse>(`/teams/${teamId}`);
  }

  /**
   * US-F1: Create a new team
   */
  createTeam(data: CreateTeamRequest): Observable<TeamResponse> {
    return this.http.post<TeamResponse>('/teams', data);
  }

  /**
   * Update team details
   */
  updateTeam(teamId: string, data: UpdateTeamRequest): Observable<TeamResponse> {
    return this.http.patch<TeamResponse>(`/teams/${teamId}`, data);
  }

  /**
   * US-F6: Permanently delete a team
   */
  deleteTeam(teamId: string): Observable<void> {
    return this.http.delete<void>(`/teams/${teamId}`);
  }

  /**
   * US-F6: Archive a team (read-only mode)
   */
  archiveTeam(teamId: string): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(`/teams/${teamId}/archive`, {});
  }

  /**
   * Leave a team (self-removal)
   */
  leaveTeam(teamId: string): Observable<void> {
    return this.http.post<void>(`/teams/${teamId}/leave`, {});
  }

  // --- Members ---

  /**
   * US-F4: Change a team member's role
   */
  changeMemberRole(teamId: string, userId: string, data: ChangeMemberRoleRequest): Observable<TeamDetailResponse> {
    return this.http.patch<TeamDetailResponse>(`/teams/${teamId}/members/${userId}/role`, data);
  }

  /**
   * US-F5: Remove a member from the team
   */
  removeMember(teamId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`/teams/${teamId}/members/${userId}`);
  }

  // --- Invitations ---

  /**
   * US-F2: Invite a user to join the team
   */
  inviteUser(teamId: string, data: InviteMemberRequest): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`/teams/${teamId}/invitations`, data);
  }

  /**
   * Get pending invitations for a team (admin only)
   */
  getTeamInvitations(teamId: string): Observable<InvitationResponse[]> {
    return this.http.get<InvitationResponse[]>(`/teams/${teamId}/invitations`);
  }

  /**
   * Cancel a pending invitation
   */
  cancelInvitation(teamId: string, invitationId: string): Observable<void> {
    return this.http.delete<void>(`/teams/${teamId}/invitations/${invitationId}`);
  }

  /**
   * Get my pending team invitations
   */
  listMyInvitations(): Observable<InvitationResponse[]> {
    return this.http.get<InvitationResponse[]>('/teams/invitations');
  }

  /**
   * US-F3: Accept a team invitation
   */
  acceptInvitation(invitationId: string): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(`/teams/invitations/${invitationId}/accept`, {});
  }

  /**
   * US-F3: Decline a team invitation
   */
  declineInvitation(invitationId: string): Observable<void> {
    return this.http.post<void>(`/teams/invitations/${invitationId}/decline`, {});
  }
}

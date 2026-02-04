import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse
} from '../../models';
import { HttpService } from './http.service';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<UserResponse | null>(
    this.storage.get<UserResponse>(USER_KEY)
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this.getToken());

  /**
   * US-A1: Create a new user account
   */
  register(data: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/auth/register', data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * US-A2: Authenticate user and get tokens
   */
  login(data: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/auth/login', data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * Refresh authentication tokens
   */
  refreshToken(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/auth/refresh', {}).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/users/me').pipe(
      tap(user => {
        this._currentUser.set(user);
        this.storage.set(USER_KEY, user);
      })
    );
  }

  /**
   * US-A3: Logout user
   */
  logout(): void {
    // Call API to invalidate token (fire and forget)
    this.http.post<void>('/auth/logout', {}).subscribe({
      error: () => {} // Ignore errors, logout locally anyway
    });

    // Clear local storage
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(REFRESH_TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * US-A4: Request password reset email
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`/auth/request-reset?email=${encodeURIComponent(email)}`, {});
  }

  /**
   * US-A4: Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(
      `/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(newPassword)}`,
      {}
    );
  }

  getToken(): string | null {
    return this.storage.get<string>(TOKEN_KEY);
  }

  private handleAuthResponse(response: TokenResponse): void {
    this.storage.set(TOKEN_KEY, response.token);
    this.storage.set(REFRESH_TOKEN_KEY, response.refreshToken);
    this.storage.set(USER_KEY, response.user);
    this._currentUser.set(response.user);
  }
}

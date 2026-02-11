import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import {
    AuthResponse,
    AuthTokens,
    LoginRequest,
    RegisterRequest,
    RefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SuccessResponse
} from '@models/api.model';

const ACCESS_TOKEN_KEY = 'sardine_access_token';
const REFRESH_TOKEN_KEY = 'sardine_refresh_token';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private api = inject(ApiService);

    private isAuthenticatedSignal = signal<boolean>(this.hasValidToken());
    readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

    // ========================================================================
    // Auth Methods
    // ========================================================================

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('/auth/login', request).pipe(
            tap(response => this.handleAuthSuccess(response))
        );
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('/auth/register', request).pipe(
            tap(response => this.handleAuthSuccess(response))
        );
    }

    refreshToken(): Observable<AuthTokens> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return of({} as AuthTokens);
        }

        const request: RefreshRequest = { refresh_token: refreshToken };
        return this.api.post<AuthTokens>('/auth/refresh', request).pipe(
            tap(tokens => this.storeTokens(tokens)),
            catchError(() => {
                this.clearTokens();
                return of({} as AuthTokens);
            })
        );
    }

    logout(): Observable<SuccessResponse> {
        return this.api.post<SuccessResponse>('/auth/logout').pipe(
            tap(() => this.handleLogout()),
            catchError(() => {
                this.handleLogout();
                return of({ success: true });
            })
        );
    }

    forgotPassword(request: ForgotPasswordRequest): Observable<SuccessResponse> {
        return this.api.post<SuccessResponse>('/auth/forgot-password', request);
    }

    resetPassword(request: ResetPasswordRequest): Observable<SuccessResponse> {
        return this.api.post<SuccessResponse>('/auth/reset-password', request);
    }

    // ========================================================================
    // Token Management
    // ========================================================================

    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    // ========================================================================
    // Private Methods
    // ========================================================================

    private handleAuthSuccess(response: AuthResponse): void {
        this.storeTokens(response.tokens);
        this.isAuthenticatedSignal.set(true);
    }

    private handleLogout(): void {
        this.clearTokens();
        this.isAuthenticatedSignal.set(false);
    }

    private storeTokens(tokens: AuthTokens): void {
        if (tokens.access_token) {
            localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        }
        if (tokens.refresh_token) {
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        }
    }

    private clearTokens(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    private hasValidToken(): boolean {
        return !!this.getAccessToken();
    }
}

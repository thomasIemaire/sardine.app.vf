// Auth Models - Based on API specification

export type UserRole = 'user' | 'admin';

export interface UserResponse {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: UserRole;
  createdAt?: string | null;
}

export interface RegisterRequest {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface EmailExistsResponse {
  exists: boolean;
}

export type Role = 'Admin' | 'Receptionist' | 'Security Guard';

export interface LoginRequest {
  username: string;
  password: string;
  role: Role;
  keepLoggedIn: boolean;
}

export interface LoginSuccessResponse {
  accessToken: string;
  role: Role;
  redirectUrl: string;
}

export interface ApiErrorResponse {
  detail: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpSuccessResponse {
  resetToken: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SessionResponse {
  valid: boolean;
  expiresInSeconds: number;
}

export const ROLE_REDIRECT_MAP: Record<Role, string> = {
  Admin: '/dashboard',
  Receptionist: '/visitor-entry',
  'Security Guard': '/gate-entry',
};

export const ACCESS_TOKEN_KEY = 'accessToken';

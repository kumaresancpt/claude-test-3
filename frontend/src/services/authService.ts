import {
  ACCESS_TOKEN_KEY,
  ForgotPasswordRequest,
  LoginRequest,
  LoginSuccessResponse,
  ResetPasswordRequest,
  SessionResponse,
  VerifyOtpRequest,
  VerifyOtpSuccessResponse,
} from './types';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function parseJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractDetail(data: any, fallback: string): string {
  return data?.detail ?? fallback;
}

export async function login(payload: LoginRequest): Promise<LoginSuccessResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(response.status, extractDetail(data, 'Unable to login. Please try again.'));
  }

  return data as LoginSuccessResponse;
}

export async function logout(): Promise<void> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}

export async function forgotPassword(payload: ForgotPasswordRequest): Promise<{ detail: string }> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(response.status, extractDetail(data, 'Unable to send OTP. Please try again.'));
  }

  return data as { detail: string };
}

export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpSuccessResponse> {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(response.status, extractDetail(data, 'Unable to verify OTP. Please try again.'));
  }

  return data as VerifyOtpSuccessResponse;
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<{ detail: string }> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(response.status, extractDetail(data, 'Unable to reset password. Please try again.'));
  }

  return data as { detail: string };
}

export async function getSession(): Promise<SessionResponse> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  const response = await fetch('/api/auth/session', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(response.status, extractDetail(data, 'Session expired.'));
  }

  return data as SessionResponse;
}

/**
 * Extracts the remaining lockout duration (in minutes) from a backend
 * lockout message, e.g. "Account locked. Try again in 5 minutes."
 * Returns null if no number of minutes can be found.
 */
export function parseLockoutMinutes(detail: string | null | undefined): number | null {
  if (!detail) {
    return null;
  }
  const match = detail.match(/(\d+(?:\.\d+)?)\s*minute/i);
  if (!match) {
    return null;
  }
  const minutes = parseFloat(match[1]);
  return Number.isNaN(minutes) ? null : minutes;
}

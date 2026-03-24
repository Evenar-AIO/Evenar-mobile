export type UserRole = 'admin' | 'customer' | 'event_owner' | 'organizer';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface SignupOptionRequest {
  email: string;
}

export interface SignupOptionResponse {
  roles: UserRole[];
  message?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
  phoneNumber?: string;
}

export interface VerifyRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface SendResetOtpRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface GoogleLoginResponse {
  url?: string;
  user?: User;
  tokens?: AuthTokens;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

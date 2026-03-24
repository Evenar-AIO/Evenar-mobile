import { AUTH_ENDPOINTS } from '@/common/constants/apiEndpoints';
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  GoogleLoginResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  SendResetOtpRequest,
  SignupOptionRequest,
  SignupOptionResponse,
  VerifyRequest,
} from '@/features/auth/types/authTypes';
import { request } from '@/services/apiClient';

export const authService = {
  signupOption: (payload: SignupOptionRequest) =>
    request<SignupOptionResponse>(AUTH_ENDPOINTS.signupOption, {
      method: 'POST',
      body: payload,
    }),

  register: (payload: RegisterRequest) =>
    request<{ message?: string }>(AUTH_ENDPOINTS.register, {
      method: 'POST',
      body: payload,
    }),

  verify: (payload: VerifyRequest) =>
    request<{ message?: string }>(AUTH_ENDPOINTS.verify, {
      method: 'POST',
      body: payload,
    }),

  login: (payload: LoginRequest) =>
    request<LoginResponse>(AUTH_ENDPOINTS.login, {
      method: 'POST',
      body: payload,
    }),

  loginGoogle: () =>
    request<GoogleLoginResponse>(AUTH_ENDPOINTS.loginGoogle, {
      method: 'GET',
    }),

  logout: () =>
    request<{ message?: string }>(AUTH_ENDPOINTS.logout, {
      method: 'POST',
    }),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    request<{ message?: string }>(AUTH_ENDPOINTS.forgotPassword, {
      method: 'POST',
      body: payload,
    }),

  sendResetOtp: (payload: SendResetOtpRequest) =>
    request<{ message?: string }>(AUTH_ENDPOINTS.sendResetOtp, {
      method: 'POST',
      body: payload,
    }),

  resetPassword: (payload: ResetPasswordRequest) =>
    request<{ message?: string }>(AUTH_ENDPOINTS.resetPassword, {
      method: 'POST',
      body: payload,
    }),

  changePassword: (payload: ChangePasswordRequest) =>
    request<{ message?: string }>(AUTH_ENDPOINTS.changePassword, {
      method: 'POST',
      body: payload,
    }),
};

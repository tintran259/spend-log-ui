import { apiClient } from '@/services/axios';
import {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
  GoogleAuthRequest,
  FacebookAuthRequest,
  RefreshTokenRequest,
  AuthTokens,
  ApiResponse,
} from '@/types/auth.types';

export const authApi = {
  register: (data: RegisterRequest): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>('/auth/register', data).then(r => r.data),

  login: (data: LoginRequest): Promise<ApiResponse<AuthTokens>> =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data).then(r => r.data),

  verifyEmail: (data: VerifyEmailRequest): Promise<ApiResponse<AuthTokens>> =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/verify-email', data).then(r => r.data),

  resendOtp: (data: ResendOtpRequest): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>('/auth/resend-otp', data).then(r => r.data),

  forgotPassword: (data: ForgotPasswordRequest): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>('/auth/forgot-password', data).then(r => r.data),

  verifyResetOtp: (data: VerifyResetOtpRequest): Promise<ApiResponse<{ resetToken: string }>> =>
    apiClient.post<ApiResponse<{ resetToken: string }>>('/auth/verify-reset-otp', data).then(r => r.data),

  resetPassword: (data: ResetPasswordRequest): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>('/auth/reset-password', data).then(r => r.data),

  googleAuth: (data: GoogleAuthRequest): Promise<ApiResponse<AuthTokens>> =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/google', data).then(r => r.data),

  facebookAuth: (data: FacebookAuthRequest): Promise<ApiResponse<AuthTokens>> =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/facebook', data).then(r => r.data),

  refreshToken: (data: RefreshTokenRequest): Promise<ApiResponse<AuthTokens>> =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh-token', data).then(r => r.data),
};

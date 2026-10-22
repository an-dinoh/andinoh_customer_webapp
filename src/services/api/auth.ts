import { apiClient } from '@/utils/api';
import type { AccountProfile, AuthSession, DeviceSession, LoginRequest, MessageResponse, RegisterRequest } from '@/types/api';

// Customer guide 3 and shared guide 3–5: sign-in, sessions, email verification, passwords, account basics.

type Revoked = MessageResponse & { revoked_count: number };

export const authApi = {
  /** Signs in straight away; the email isn't verified yet (3.1). Same email and password again signs in. */
  register: (body: RegisterRequest) => apiClient.post<AuthSession>('/auth/register/', body),
  login: (body: LoginRequest) => apiClient.post<AuthSession>('/auth/login/', body),
  google: (id_token: string) => apiClient.post<AuthSession>('/auth/google/', { id_token }),
  logout: (refresh_token: string) => apiClient.post<MessageResponse>('/auth/logout/', { refresh_token }),

  sessions: () => apiClient.get<DeviceSession[]>('/auth/sessions/'),
  signOutOthers: (refresh_token: string) => apiClient.post<Revoked>('/auth/sessions/all/', { refresh_token }),
  signOutEverywhere: () => apiClient.delete<Revoked>('/auth/sessions/all/'),

  requestEmailCode: () => apiClient.post<MessageResponse>('/auth/email/verify/request/'),
  /** Also moves guest bookings made with this email into the account (7.6). */
  confirmEmail: (otp: string) => apiClient.post<MessageResponse & { is_verified: boolean }>('/auth/email/verify/confirm/', { otp }),

  requestPasswordReset: (email: string) => apiClient.post<MessageResponse>('/auth/password-reset/request/', { email }),
  verifyResetCode: (email: string, otp: string) =>
    apiClient.post<MessageResponse & { valid: boolean; reset_token: string }>('/auth/password-reset/verify-otp/', { email, otp }),
  resetPassword: (reset_token: string, new_password: string) =>
    apiClient.post<MessageResponse>('/auth/password-reset/confirm/', { reset_token, new_password }),
  /** The one-step form (email, code and new password together). */
  resetPasswordWithCode: (email: string, otp: string, new_password: string) =>
    apiClient.post<MessageResponse>('/auth/password-reset/confirm/', { email, otp, new_password }),

  /** Signs out every other device; store the returned tokens (3.8). */
  changePassword: (current_password: string, new_password: string) =>
    apiClient.post<MessageResponse & AuthSession>('/auth/password/change/', { current_password, new_password }),

  profile: () => apiClient.get<AccountProfile>('/auth/profile/'),
  updateProfile: (body: Partial<Pick<AccountProfile, 'full_name' | 'phone_number'>>) => apiClient.patch<AccountProfile>('/auth/profile/', body),
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'Super Admin' | 'Operations Lead' | 'Event Curator' | 'Driver Auditor' | string;
  avatar?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterAdminPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
}

export interface LoginAdminPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  status?: string;
  success?: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AdminUser;
  admin?: AdminUser;
  data?: {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: string;
    refreshExpiresAt?: string;
    user?: AdminUser;
    admin?: AdminUser;
  };
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  status?: string;
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: string;
    refreshExpiresAt?: string;
  };
}

export interface LogoutPayload {
  refreshToken?: string;
}

export interface ApiMessageResponse {
  status?: string;
  success?: boolean;
  message: string;
  data?: unknown;
}

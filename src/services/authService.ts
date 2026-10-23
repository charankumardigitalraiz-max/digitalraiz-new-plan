import { apiClient, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './apiClient';
import type {
  AdminUser,
  RegisterAdminPayload,
  LoginAdminPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  RefreshTokenResponse,
  LogoutPayload,
  AuthResponse,
  ApiMessageResponse
} from '../types/auth';

/**
 * Authentication Service for Wayfer Admin Panel
 * Matches curl APIs in public/auth.txt (Endpoints 1 - 7)
 */
class AuthService {
  /**
   * 1. Register Admin
   * POST /api/admin/auth/register
   * Body: { name, email, phone, password, role }
   */
  async registerAdmin(payload: RegisterAdminPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/admin/auth/register',
      {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        password: payload.password,
        role: payload.role || 'admin'
      },
      { skipAuth: true }
    );

    const token = this.extractToken(response);
    if (token) {
      this.setToken(token);
    }

    const refreshToken = this.extractRefreshToken(response);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }

    const user = this.extractUser(response);
    if (user) {
      this.setCurrentUser(user);
    }

    return response;
  }

  /**
   * 2. Login Admin (Email + Password)
   * POST /api/admin/auth/login
   * Body: { email, password }
   */
  async loginAdmin(payload: LoginAdminPayload): Promise<{ user: AdminUser; token?: string; refreshToken?: string }> {
    const response = await apiClient.post<AuthResponse>(
      '/api/admin/auth/login',
      {
        email: payload.email.trim().toLowerCase(),
        password: payload.password
      },
      { skipAuth: true }
    );

    const token = this.extractToken(response);
    if (token) {
      this.setToken(token);
    }

    const refreshToken = this.extractRefreshToken(response);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }

    let user = this.extractUser(response);
    if (!user) {
      // If user object is omitted in response, create an admin user shell from email
      user = {
        id: `usr_${Date.now()}`,
        name: payload.email.split('@')[0].toUpperCase(),
        email: payload.email.trim().toLowerCase(),
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        department: 'Operations & Platform'
      };
    }

    this.setCurrentUser(user);
    return { user, token, refreshToken };
  }

  /**
   * 3. Forgot Password
   * POST /api/admin/auth/forgot-password
   * Body: { email }
   */
  async forgotPassword(email: string): Promise<ApiMessageResponse> {
    return apiClient.post<ApiMessageResponse>(
      '/api/admin/auth/forgot-password',
      { email: email.trim().toLowerCase() } as ForgotPasswordPayload,
      { skipAuth: true }
    );
  }

  /**
   * 4. Reset Password
   * POST /api/admin/auth/reset-password
   * Body: { token, newPassword }
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiMessageResponse> {
    return apiClient.post<ApiMessageResponse>(
      '/api/admin/auth/reset-password',
      {
        token: payload.token.trim(),
        newPassword: payload.newPassword
      },
      { skipAuth: true }
    );
  }

  /**
   * 5. Get Current Admin Profile (Verify Bearer Token)
   * GET /api/admin/auth/me
   * Headers: Authorization: Bearer <TOKEN>
   */
  async getCurrentAdminProfile(): Promise<AdminUser> {
    const response = await apiClient.get<any>('/api/admin/auth/me');
    const user = this.extractUser(response) || response;
    if (user && user.email) {
      this.setCurrentUser(user);
      return user;
    }
    throw new Error('Invalid user profile response received from server.');
  }

  /**
   * 6. Refresh Access Token (With Token Rotation)
   * POST /api/admin/auth/refresh-token
   * Body: { refreshToken }
   */
  async refreshAccessToken(refreshTokenOverride?: string): Promise<RefreshTokenResponse> {
    const refreshToken = refreshTokenOverride || this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token found to renew admin session.');
    }

    const response = await apiClient.post<RefreshTokenResponse>(
      '/api/admin/auth/refresh-token',
      { refreshToken } as RefreshTokenPayload,
      { skipAuth: true }
    );

    const newAccessToken = this.extractToken(response);
    if (newAccessToken) {
      this.setToken(newAccessToken);
    }

    const newRefreshToken = this.extractRefreshToken(response);
    if (newRefreshToken) {
      this.setRefreshToken(newRefreshToken);
    }

    return response;
  }

  /**
   * 7. Logout Admin (Revoke Refresh Token)
   * POST /api/admin/auth/logout
   * Body: { refreshToken }
   */
  async logoutAdmin(): Promise<ApiMessageResponse> {
    const refreshToken = this.getRefreshToken();

    try {
      if (refreshToken) {
        await apiClient.post<ApiMessageResponse>(
          '/api/admin/auth/logout',
          { refreshToken } as LogoutPayload,
          { skipAuth: false }
        );
      }
    } catch (err) {
      console.warn('Backend token revocation notification notice:', err);
    } finally {
      this.clearAllAuth();
    }

    return { status: 'success', message: 'Admin logged out successfully' };
  }

  /**
   * Token & Session Utilities
   */
  getToken(): string | null {
    return apiClient.getToken();
  }

  setToken(token: string): void {
    apiClient.setToken(token);
  }

  clearToken(): void {
    apiClient.clearToken();
  }

  getRefreshToken(): string | null {
    return apiClient.getRefreshToken();
  }

  setRefreshToken(token: string): void {
    apiClient.setRefreshToken(token);
  }

  clearRefreshToken(): void {
    apiClient.clearRefreshToken();
  }

  clearAllAuth(): void {
    apiClient.clearAllTokens();
    this.clearCurrentUser();
  }

  getCurrentUser(): AdminUser | null {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: AdminUser): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Unable to persist current user:', e);
    }
  }

  clearCurrentUser(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to clear user:', e);
    }
  }

  logout(): void {
    this.logoutAdmin().catch(() => {});
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken() || this.getCurrentUser());
  }

  /**
   * Helpers to safely extract token, refresh token & user across varying backend wrapper schemas
   */
  public extractToken(response: any): string | undefined {
    return (
      response?.token ||
      response?.accessToken ||
      response?.data?.token ||
      response?.data?.accessToken ||
      response?.data?.jwt
    );
  }

  public extractRefreshToken(response: any): string | undefined {
    return (
      response?.refreshToken ||
      response?.data?.refreshToken ||
      response?.data?.refresh_token
    );
  }

  public extractUser(response: any): AdminUser | undefined {
    const candidate =
      response?.user ||
      response?.admin ||
      response?.data?.user ||
      response?.data?.admin ||
      (response?.id && response?.email ? response : undefined);

    if (!candidate) return undefined;

    return {
      id: candidate.id || candidate._id || `usr_${Date.now()}`,
      name: candidate.name || candidate.username || 'System Administrator',
      email: candidate.email,
      phone: candidate.phone,
      role: candidate.role || 'Super Admin',
      avatar:
        candidate.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      department: candidate.department || 'Platform Operations'
    };
  }
}

export const authService = new AuthService();
export { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, USER_STORAGE_KEY };


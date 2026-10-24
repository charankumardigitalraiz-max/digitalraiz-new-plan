/**
 * Wayfer & Digitalraiz Central API Client
 * Base URL defaults to http://localhost:5000 (or VITE_API_BASE_URL)
 */

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  _isRetry?: boolean;
}

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://192.168.0.161:5001';

export const TOKEN_STORAGE_KEY = 'wayfer_admin_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'wayfer_admin_refresh_token';
export const USER_STORAGE_KEY = 'digitalraiz_admin_user';

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  public setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.warn('Unable to persist auth token:', e);
    }
  }

  public clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to remove auth token:', e);
    }
  }

  public getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  public setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.warn('Unable to persist refresh token:', e);
    }
  }

  public clearRefreshToken(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to remove refresh token:', e);
    }
  }

  public clearAllTokens(): void {
    this.clearToken();
    this.clearRefreshToken();
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to remove user data:', e);
    }
  }

  /**
   * Refresh the access token using the stored refresh token
   * Uses singleton promise pattern so multiple simultaneous 401s share 1 request
   */
  public async performTokenRefresh(refreshTokenOverride?: string): Promise<string | null> {
    const refreshToken = refreshTokenOverride || this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshUrl = `${this.baseUrl}/api/admin/auth/refresh-token`;
        const res = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to refresh access token');
        }

        const newAccessToken =
          data?.token ||
          data?.accessToken ||
          data?.data?.token ||
          data?.data?.accessToken;

        const newRefreshToken =
          data?.refreshToken ||
          data?.data?.refreshToken;

        if (newAccessToken) {
          this.setToken(newAccessToken);
        }

        if (newRefreshToken) {
          this.setRefreshToken(newRefreshToken);
        }

        return newAccessToken || null;
      } catch (err) {
        console.warn('Failed to refresh access token:', err);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private isSessionExpiring = false;

  /**
   * Helper to identify if an API response indicates an invalid or expired authentication token
   */
  public isTokenExpiredMessage(status: number, data: any): boolean {
    if (status === 401) {
      return true;
    }
    if (!data) {
      return false;
    }

    const rawMsg =
      typeof data === 'string'
        ? data
        : data?.message || data?.error || data?.msg || '';

    if (typeof rawMsg === 'string' && rawMsg.trim()) {
      const msg = rawMsg.toLowerCase().trim();
      if (
        msg.includes('invalid or expired token') ||
        msg.includes('expired token') ||
        msg.includes('invalid token') ||
        msg.includes('token expired') ||
        msg.includes('jwt expired') ||
        msg.includes('token has expired') ||
        msg === 'jwt malformed' ||
        msg === 'unauthorized'
      ) {
        return true;
      }
    }

    if (data?.status === 'error' && typeof rawMsg === 'string') {
      const msg = rawMsg.toLowerCase();
      if (msg.includes('token') && (msg.includes('invalid') || msg.includes('expired'))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Standard session expiry:
   * 1. Clear local storage entirely
   * 2. Clear all tokens and session data
   * 3. Dispatch global 'auth:session-expired' event to navigate user back to login screen
   */
  public triggerSessionExpiry(reason: string = 'Invalid or expired token.'): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Failed to clear localStorage on session expiry:', e);
    }
    this.clearAllTokens();

    if (this.isSessionExpiring) {
      return;
    }
    this.isSessionExpiring = true;
    setTimeout(() => {
      this.isSessionExpiring = false;
    }, 2000);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('auth:session-expired', {
          detail: { message: reason }
        })
      );
    }
  }

  /**
   * Universal Request Handler with Automatic 401 Token Refresh & Retry
   */
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, skipAuth = false, _isRetry = false, headers: customHeaders, ...fetchOptions } = options;

    // Build URL with query params
    let url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    // Default Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((customHeaders as Record<string, string>) || {})
    };

    // Attach JWT Bearer Token if present
    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers
      });

      // Parse JSON response or fall back to plain text
      let responseData: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json().catch(() => null);
      } else {
        responseData = await response.text().catch(() => null);
      }

      // Check if this endpoint is an unauthenticated auth action (login, register, forgot-password)
      const isAuthEndpoint =
        endpoint.includes('/api/admin/auth/login') ||
        endpoint.includes('/api/admin/auth/register') ||
        endpoint.includes('/api/admin/auth/forgot-password') ||
        endpoint.includes('/api/admin/auth/reset-password');

      // Check if backend returned invalid/expired token message or 401 status
      const isTokenExpired = !isAuthEndpoint && this.isTokenExpiredMessage(response.status, responseData);

      if (isTokenExpired) {
        // Attempt automatic token refresh once if refresh token is present
        if (
          !_isRetry &&
          !endpoint.includes('/refresh-token') &&
          Boolean(this.getRefreshToken())
        ) {
          const refreshedToken = await this.performTokenRefresh();
          if (refreshedToken) {
            return this.request<T>(endpoint, {
              ...options,
              _isRetry: true
            });
          }
        }

        // Token is invalid/expired and cannot be refreshed: trigger session expiry
        const reason =
          responseData?.message ||
          responseData?.error ||
          'Invalid or expired token.';
        this.triggerSessionExpiry(reason);
        throw new ApiError(reason, 401, responseData);
      }

      if (!response.ok) {
        const errorMsg =
          responseData?.message ||
          responseData?.error ||
          `Request failed with status ${response.status}`;
        throw new ApiError(errorMsg, response.status, responseData);
      }

      return responseData as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }

      // Network error, connection refused, or server offline
      throw new ApiError(
        err?.message || 'Network connectivity error. Verify the API backend is running on ' + this.baseUrl,
        0,
        err
      );
    }
  }

  get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

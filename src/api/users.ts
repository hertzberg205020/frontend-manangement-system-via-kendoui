import type { Permission } from '@/constants/permissions';
import { get, post } from '@/utils/http/request';

interface LoginData {
  account: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

/**
 * Custom login error with error code for better error handling
 */
export class LoginError extends Error {
  code: number | string;
  type: 'auth' | 'validation' | 'network' | 'server';

  constructor(
    message: string,
    code: number | string,
    type: 'auth' | 'validation' | 'network' | 'server'
  ) {
    super(message);
    this.name = 'LoginError';
    this.code = code;
    this.type = type;
  }
}

export async function login(data: LoginData): Promise<LoginResponse> {
  try {
    // Skip automatic error notification and redirect - let this function handle it
    const res = await post<LoginResponse, LoginData>('api/auth/login', data, {
      skipErrorNotification: true,
    });

    // Success path - validate response structure
    if (res.code >= 200 && res.code < 300) {
      // Runtime type validation
      if (!res.data || typeof res.data !== 'object' || !('token' in res.data)) {
        throw new LoginError('登入回應格式錯誤，請聯絡技術支援', 'INVALID_RESPONSE', 'server');
      }

      if (typeof res.data.token !== 'string') {
        throw new LoginError('登入憑證格式錯誤，請聯絡技術支援', 'INVALID_TOKEN', 'server');
      }

      return res.data;
    }

    // Error path - provide specific error messages based on status code
    if (res.code === 401) {
      throw new LoginError('帳號或密碼錯誤，請重新輸入', res.code, 'auth');
    } else if (res.code === 403) {
      throw new LoginError('此帳號已被停用，請聯絡管理員', res.code, 'auth');
    } else if (res.code === 400) {
      throw new LoginError('請輸入有效的帳號和密碼', res.code, 'validation');
    } else if (res.code >= 500) {
      throw new LoginError('伺服器異常，請稍後再試', res.code, 'server');
    } else {
      throw new LoginError(res.message || '登入失敗，請稍後再試', res.code, 'server');
    }
  } catch (error) {
    // If it's already a LoginError, rethrow it
    if (error instanceof LoginError) {
      throw error;
    }

    // Handle HttpError from http interceptor
    if (error && typeof error === 'object' && 'type' in error) {
      const httpError = error as { type: string; message: string; code?: number | string };

      // Map HTTP error types to LoginError with appropriate messages
      switch (httpError.type) {
        case 'UNAUTHORIZED':
          // 401 during login means wrong credentials
          throw new LoginError('帳號或密碼錯誤', httpError.code || 401, 'auth');

        case 'NETWORK_ERROR':
        case 'TIMEOUT_ERROR':
          throw new LoginError(
            '網路連線異常，請檢查網路後重試',
            httpError.code || 'NETWORK_ERROR',
            'network'
          );

        case 'SERVER_ERROR':
          throw new LoginError('伺服器異常，請稍後再試', httpError.code || 500, 'server');

        default:
          throw new LoginError(
            httpError.message || '登入過程發生錯誤',
            httpError.code || 'UNKNOWN_ERROR',
            'server'
          );
      }
    }

    // Fallback for unknown errors
    throw new LoginError('登入過程發生錯誤，請稍後再試', 'UNKNOWN_ERROR', 'server');
  }
}

/**
 * Fetches the list of permissions for the currently authenticated user.
 *
 * @return {Promise<Permission[]>} A promise that resolves to an array of permissions for the user.
 */
export async function getUserPermissions(): Promise<Permission[]> {
  const res = await get<Permission[]>('api/auth/me/permissions');

  if (!(res.code >= 200 && res.code < 300)) {
    throw new Error(res.message);
  }

  if (!Array.isArray(res.data)) {
    throw new Error('Invalid permissions format');
  }

  return res.data;
}

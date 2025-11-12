import type { Permission } from '@/constants/permissions';
import { get, post } from '@/utils/http/request';


interface LoginData {
  account: string;
  password: string;
}

interface LoginResponse {
  token: string;
}



export async function login(data: LoginData): Promise<LoginResponse> {
  const res = await post<LoginResponse, LoginData>('api/auth/login', data);

  if (res.code < 200 || res.code >= 300) {
    throw new Error(res.message);
  }

  // check data type
  if (!res.data || typeof res.data !== 'object' || !('token' in res.data)) {
    throw new Error('Invalid response format');
  }

  // 運行時型別檢查,確保 token 是字串
  if (typeof res.data.token !== 'string') {
    throw new Error('Invalid token type');
  }

  return res.data;
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

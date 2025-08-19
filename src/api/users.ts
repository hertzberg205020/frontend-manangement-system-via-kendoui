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

  return res.data;
}


/**
 * 取得使用者權限
 *
 * 重構說明：
 * 這個函式現在返回權限字串陣列而不是選單項目陣列。
 * 這種設計的優勢：
 * 1. 更清晰的職責分離：後端只負責權限，前端負責 UI 呈現
 * 2. 更靈活的權限控制：可以更精細地控制功能存取
 * 3. 更容易維護：權限變更不需要修改選單結構
 */
export async function getUserPermissions(): Promise<Permission[]> {
  const res = await get<Permission[]>('/permissions');
  return res.data;
}

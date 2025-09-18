/**
 * Authorization Center API 封裝 (P0)
 *
 * 說明：
 * - 集中管理授權/使用者/角色/權限相關 HTTP 請求。
 * - 目前僅單純呼叫基礎 http wrapper (get/post)，並返回解包後的 data。
 * - 後續 P1 會由 hook 透過 feature flag 決定是否使用這些 API。
 * - 後續 P3~P7 會逐步擴充：錯誤回滾、快取失效、權限樹載入與懶加載、角色權限編輯等。
 *
 * 擴充點 (TODO placeholders)：
 * - invalidateAuthorizationCache(keys?: string[]) => void
 * - attachAbortController / cancellation
 * - metrics / performance 標記
 */

import { get, post } from '@/utils/http/request';
import type { PaginatedResponse } from '@/types/PaginatedResponse';

/** 使用者資料傳輸物件 */
export interface UserDTO {
  id: number;
  username: string;
  email?: string;
  status?: 'active' | 'inactive' | 'locked';
  roles?: string[]; // 過渡期仍可能存在 (P2 會加入 roleIds)
  created_at?: string;
  updated_at?: string;
}

/** 角色資料傳輸物件 */
export interface RoleDTO {
  id: number;
  name: string;
  description?: string;
  permission_count?: number; // 後端可回傳統計
  created_at?: string;
  updated_at?: string;
}

/** 權限資料傳輸物件 */
export interface PermissionDTO {
  id: number;
  action: string; // P2 後續收斂為 PermissionAction union
  resource: string;
  description?: string;
}

/** 資源 (可選：若後端提供資源樹) */
export interface ResourceDTO {
  id: number;
  name: string;
  code: string; // 用於組合 permission key
  parent_id?: number | null;
  order?: number;
  children?: ResourceDTO[];
}

/** 角色權限列表回傳 */
export interface RolePermissionsResponse {
  roleId: number;
  permissionIds: number[];
}

/** 使用者角色更新輸入 */
export interface UpdateUserRolesPayload {
  roleIds: number[];
}

/** 角色權限更新輸入 */
export interface UpdateRolePermissionsPayload {
  permissionIds: number[];
}

/** Auth Me 回傳 */
export interface AuthMeDTO {
  id: number;
  username: string;
  roleIds?: number[]; // P2 導入
  permissions?: string[]; // 平面權限字串陣列
}

/** 分頁查詢參數 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// ---------------------------
// 使用者相關 API
// ---------------------------

export async function getUsers(
  params: PaginationQuery = {}
): Promise<PaginatedResponse<UserDTO>> {
  // 強制轉型為 Record<string, unknown> 以符合 http wrapper 要求
  const res = await get<PaginatedResponse<UserDTO>>(
    '/auth/users',
    params as Record<string, unknown>
  );
  return res.data;
}

export async function createUser(data: Partial<UserDTO>): Promise<UserDTO> {
  const res = await post<UserDTO, Partial<UserDTO>>('/auth/users/create', data);
  return res.data;
}

export async function updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO> {
  const res = await post<UserDTO, Partial<UserDTO>>(`/auth/users/update/${id}`, data);
  return res.data;
}

export async function deleteUser(
  id: number
): Promise<{ success: boolean } | string> {
  const res = await post<{ success: boolean } | string, { id: number }>(
    '/auth/users/delete',
    { id }
  );
  return res.data;
}

// ---------------------------
// 角色相關 API
// ---------------------------

export async function getRoles(): Promise<RoleDTO[]> {
  const res = await get<RoleDTO[]>('/auth/roles');
  return res.data;
}

export async function createRole(data: Partial<RoleDTO>): Promise<RoleDTO> {
  const res = await post<RoleDTO, Partial<RoleDTO>>('/auth/roles/create', data);
  return res.data;
}

export async function updateRole(id: number, data: Partial<RoleDTO>): Promise<RoleDTO> {
  const res = await post<RoleDTO, Partial<RoleDTO>>(`/auth/roles/update/${id}`, data);
  return res.data;
}

export async function deleteRole(
  id: number
): Promise<{ success: boolean } | string> {
  const res = await post<{ success: boolean } | string, { id: number }>(
    '/auth/roles/delete',
    { id }
  );
  return res.data;
}

// ---------------------------
// 資源與權限 API
// ---------------------------

export async function getResources(): Promise<ResourceDTO[]> {
  const res = await get<ResourceDTO[]>('/auth/resources');
  return res.data;
}

export async function getPermissions(): Promise<PermissionDTO[]> {
  const res = await get<PermissionDTO[]>('/auth/permissions');
  return res.data;
}

export async function getRolePermissions(roleId: number): Promise<RolePermissionsResponse> {
  const res = await get<RolePermissionsResponse>(`/auth/roles/${roleId}/permissions`);
  return res.data;
}

export async function updateRolePermissions(
  roleId: number,
  payload: UpdateRolePermissionsPayload
): Promise<RolePermissionsResponse> {
  const res = await post<RolePermissionsResponse, UpdateRolePermissionsPayload>(
    `/auth/roles/${roleId}/permissions/update`,
    payload
  );
  return res.data;
}

// ---------------------------
// 使用者角色指派
// ---------------------------

export async function updateUserRoles(
  userId: number,
  payload: UpdateUserRolesPayload
): Promise<{ userId: number; roleIds: number[]; }> {
  const res = await post<{ userId: number; roleIds: number[]; }, UpdateUserRolesPayload>(
    `/auth/users/${userId}/roles/update`,
    payload
  );
  return res.data;
}

// ---------------------------
// Auth Me
// ---------------------------

export async function getAuthMe(): Promise<AuthMeDTO> {
  const res = await get<AuthMeDTO>('/auth/me');
  return res.data;
}

// ---------------------------
// 後續：可加入快取失效與 batch 操作等
// ---------------------------

export const authorizationApi = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getResources,
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  updateUserRoles,
  getAuthMe
};

export type { UserDTO as AuthorizationUserDTO, RoleDTO as AuthorizationRoleDTO };

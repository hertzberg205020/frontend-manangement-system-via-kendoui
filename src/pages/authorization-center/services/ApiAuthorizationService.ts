/**
 * API Authorization Service 實作
 *
 * 透過 HTTP API 與後端通訊：
 * - 使用專案既有的 http wrapper (request.ts)
 * - 統一錯誤處理
 * - 支援請求取消（未來擴展）
 * - 支援請求重試（未來擴展）
 */

import type { IAuthorizationService } from './IAuthorizationService';
import type { PaginatedResponse } from '@/types/PaginatedResponse';
import type {
  UserDTO,
  RoleDTO,
  ResourceDTO,
  PermissionDTO,
  RolePermissionsResponse,
  UpdateUserRolesPayload,
  UpdateRolePermissionsPayload,
  AuthMeDTO,
  PaginationQuery,
} from '../api/authorization';
import * as authApi from '../api/authorization';

/**
 * API Authorization Service 實作類別
 *
 * 直接使用 authorization.ts 中定義的 API 函式
 */
export class ApiAuthorizationService implements IAuthorizationService {
  // ==================== 使用者相關 ====================

  async getUsers(params: PaginationQuery = {}): Promise<PaginatedResponse<UserDTO>> {
    return authApi.getUsers(params);
  }

  async createUser(data: Partial<UserDTO>): Promise<UserDTO> {
    return authApi.createUser(data);
  }

  async updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO> {
    return authApi.updateUser(id, data);
  }

  async deleteUser(id: number): Promise<{ success: boolean } | string> {
    return authApi.deleteUser(id);
  }

  async updateUserRoles(
    userId: number,
    payload: UpdateUserRolesPayload
  ): Promise<{ userId: number; roleIds: number[] }> {
    return authApi.updateUserRoles(userId, payload);
  }

  // ==================== 角色相關 ====================

  async getRoles(): Promise<RoleDTO[]> {
    return authApi.getRoles();
  }

  async createRole(data: Partial<RoleDTO>): Promise<RoleDTO> {
    return authApi.createRole(data);
  }

  async updateRole(id: number, data: Partial<RoleDTO>): Promise<RoleDTO> {
    return authApi.updateRole(id, data);
  }

  async deleteRole(id: number): Promise<{ success: boolean } | string> {
    return authApi.deleteRole(id);
  }

  async getRolePermissions(roleId: number): Promise<RolePermissionsResponse> {
    return authApi.getRolePermissions(roleId);
  }

  async updateRolePermissions(
    roleId: number,
    payload: UpdateRolePermissionsPayload
  ): Promise<RolePermissionsResponse> {
    return authApi.updateRolePermissions(roleId, payload);
  }

  // ==================== 資源與權限 ====================

  async getResources(): Promise<ResourceDTO[]> {
    return authApi.getResources();
  }

  async getPermissions(): Promise<PermissionDTO[]> {
    return authApi.getPermissions();
  }

  // ==================== 認證相關 ====================

  async getAuthMe(): Promise<AuthMeDTO> {
    return authApi.getAuthMe();
  }
}

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
import type { PagedData } from '@/types/PagedData';
import type { ApiResponse } from '@/utils/http/request';
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
import {
  getUsers as fetchAuthUsers,
  createUser as createAuthUser,
  updateUser as updateAuthUser,
  deleteUser as deleteAuthUser,
  replaceUserRoles as replaceAuthUserRoles,
} from '@/api/auth-management';
import type {
  UserResponse as AuthUserResponse,
  UserQuery as AuthUserQuery,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UserRolesDto,
} from '@/api/auth-management';
import * as authApi from '../api/authorization';

type AuthUserLike = AuthUserResponse | CreateUserResponse;

/**
 * API Authorization Service 實作類別
 *
 * 直接使用 authorization.ts 中定義的 API 函式
 */
export class ApiAuthorizationService implements IAuthorizationService {
  private userIdEmpIdMap = new Map<number, string>();

  // ==================== 使用者相關 ====================

  async getUsers(params: PaginationQuery = {}): Promise<PaginatedResponse<UserDTO>> {
    const query = this.buildUserQuery(params);
    const response = await this.unwrap(fetchAuthUsers(query));
    return this.mapPaginatedUsers(response);
  }

  async createUser(data: Partial<UserDTO>): Promise<UserDTO> {
    const payload = this.mapCreateUserPayload(data);
    const created = await this.unwrap(createAuthUser(payload));
    return this.mapAuthUser(created);
  }

  async updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO> {
    const empId = this.getEmpIdOrThrow(id);
    const payload = this.mapUpdateUserPayload(data);
    const updated = await this.unwrap(updateAuthUser(empId, payload));
    return this.mapAuthUser(updated);
  }

  async deleteUser(id: number): Promise<{ success: boolean } | string> {
    const empId = this.getEmpIdOrThrow(id);
    const message = await this.unwrap(deleteAuthUser(empId));
    this.userIdEmpIdMap.delete(id);
    return message ?? { success: true };
  }

  async updateUserRoles(
    userId: number,
    payload: UpdateUserRolesPayload
  ): Promise<{ userId: number; roleIds: number[] }> {
    const empId = this.getEmpIdOrThrow(userId);
    const result = await this.unwrap<UserRolesDto>(
      replaceAuthUserRoles(empId, { roleIds: payload.roleIds })
    );
    const mappedUserId = this.registerEmpId(result.empId);
    return {
      userId: mappedUserId,
      roleIds: result.roleIds,
    };
  }

  private async unwrap<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
    const response = await promise;
    return response.data;
  }

  private mapPaginatedUsers(
    payload: PagedData<AuthUserResponse>
  ): PaginatedResponse<UserDTO> {
    return {
      data: payload.data.map(user => this.mapAuthUser(user)),
      total: payload.total,
      page: payload.page,
      pageSize: payload.pageSize,
      totalPages: payload.totalPages,
    };
  }

  private mapAuthUser(user: AuthUserLike): UserDTO {
    const mappedId = this.registerEmpId(user.empId);
    return {
      id: mappedId,
      username: user.name,
      email: undefined,
      status: user.isActive ? 'active' : 'inactive',
      roles: user.roleIds?.map(roleId => `role-${roleId}`) ?? [],
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  private registerEmpId(empId: string): number {
    const numericId = this.toNumericId(empId);
    this.userIdEmpIdMap.set(numericId, empId);
    return numericId;
  }

  private toNumericId(empId: string): number {
    const digits = empId.replace(/\D+/g, '');
    if (digits) {
      return Number(digits);
    }
    return this.hashString(empId);
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private getEmpIdOrThrow(userId: number): string {
    const empId = this.userIdEmpIdMap.get(userId);
    if (!empId) {
      throw new Error(`Unable to locate employee ID for userId ${userId}`);
    }
    return empId;
  }

  private buildUserQuery(params: PaginationQuery = {}): AuthUserQuery {
    const query: AuthUserQuery = {};
    if (typeof params.page === 'number') {
      query.page = params.page;
    }
    if (typeof params.pageSize === 'number') {
      query.pageSize = params.pageSize;
    }
    if (params.keyword) {
      query.name = params.keyword;
      query.empId = params.keyword;
    }
    return query;
  }

  private mapCreateUserPayload(data: Partial<UserDTO>): CreateUserRequest {
    const formPayload = data as Partial<UserDTO> & {
      emp_id?: string;
      password?: string;
      name?: string;
    };

    if (!formPayload.emp_id) {
      throw new Error('emp_id is required to create a user');
    }
    if (!formPayload.password) {
      throw new Error('password is required to create a user');
    }

    const resolvedName = formPayload.name ?? formPayload.username;
    if (!resolvedName) {
      throw new Error('name is required to create a user');
    }

    const roleIds = this.sanitizeRoleIds(formPayload.roles);

    return {
      empId: formPayload.emp_id,
      name: resolvedName,
      password: formPayload.password,
      roleIds,
    };
  }

  private mapUpdateUserPayload(data: Partial<UserDTO>): UpdateUserRequest {
    const formPayload = data as Partial<UserDTO> & {
      name?: string;
      is_active?: boolean;
    };

    const resolvedName = formPayload.name ?? formPayload.username;
    if (!resolvedName) {
      throw new Error('name is required to update user information');
    }

    const isActive =
      typeof formPayload.is_active === 'boolean'
        ? formPayload.is_active
        : formPayload.status !== 'inactive';

    return {
      name: resolvedName,
      isActive,
    };
  }

  private sanitizeRoleIds(roleValues?: string[]): number[] | undefined {
    if (!roleValues || roleValues.length === 0) {
      return undefined;
    }

    const parsed = roleValues
      .map(value => Number(String(value).replace(/\D+/g, '')))
      .filter(id => Number.isFinite(id));

    return parsed.length > 0 ? parsed : undefined;
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

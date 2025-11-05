/**
 * Authorization Service Interface
 *
 * 定義授權中心的統一數據服務介面，支援多種實作：
 * - MockAuthorizationService: 使用本地 Mock 數據
 * - ApiAuthorizationService: 透過 HTTP API 與後端通訊
 *
 * 優勢：
 * 1. 透過 interface 抽象化數據來源
 * 2. 使用 Strategy Pattern 輕鬆切換實作
 * 3. 便於單元測試（可注入 Mock Service）
 * 4. 符合 Dependency Inversion Principle
 */

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

/**
 * 授權服務統一接口
 *
 * 所有數據服務實作都必須遵循此接口
 */
export interface IAuthorizationService {
  // ==================== 使用者相關 ====================

  /**
   * 取得使用者列表（支援分頁與搜尋）
   */
  getUsers(params?: PaginationQuery): Promise<PaginatedResponse<UserDTO>>;

  /**
   * 建立新使用者
   */
  createUser(data: Partial<UserDTO>): Promise<UserDTO>;

  /**
   * 更新使用者資料
   */
  updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO>;

  /**
   * 刪除使用者
   */
  deleteUser(id: number): Promise<{ success: boolean } | string>;

  /**
   * 更新使用者的角色
   */
  updateUserRoles(userId: number, payload: UpdateUserRolesPayload): Promise<{
    userId: number;
    roleIds: number[];
  }>;

  // ==================== 角色相關 ====================

  /**
   * 取得所有角色列表
   */
  getRoles(): Promise<RoleDTO[]>;

  /**
   * 建立新角色
   */
  createRole(data: Partial<RoleDTO>): Promise<RoleDTO>;

  /**
   * 更新角色資料
   */
  updateRole(id: number, data: Partial<RoleDTO>): Promise<RoleDTO>;

  /**
   * 刪除角色
   */
  deleteRole(id: number): Promise<{ success: boolean } | string>;

  /**
   * 取得角色的權限列表
   */
  getRolePermissions(roleId: number): Promise<RolePermissionsResponse>;

  /**
   * 更新角色的權限
   */
  updateRolePermissions(
    roleId: number,
    payload: UpdateRolePermissionsPayload
  ): Promise<RolePermissionsResponse>;

  // ==================== 資源與權限 ====================

  /**
   * 取得所有資源列表
   */
  getResources(): Promise<ResourceDTO[]>;

  /**
   * 取得所有權限列表
   */
  getPermissions(): Promise<PermissionDTO[]>;

  // ==================== 認證相關 ====================

  /**
   * 取得當前登入使用者資訊
   */
  getAuthMe(): Promise<AuthMeDTO>;
}

/**
 * Service Factory 配置選項
 */
export interface ServiceConfig {
  /**
   * 使用 Mock 數據還是真實 API
   */
  useMock: boolean;

  /**
   * Mock API 延遲時間（毫秒）
   */
  mockDelay?: number;

  /**
   * Mock API 錯誤率（0-1 之間）
   */
  mockErrorRate?: number;

  /**
   * API Base URL（僅用於 API Service）
   */
  baseUrl?: string;
}

/**
 * Service Response 統一格式
 *
 * 所有 Service 方法都應返回此格式（內部可包裝）
 */
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: Error;
}

/**
 * Batch Operation 批次操作支援（未來擴展）
 */
export interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete';
  data: T;
}

export interface BatchResult<T> {
  success: T[];
  failed: Array<{
    data: T;
    error: string;
  }>;
}

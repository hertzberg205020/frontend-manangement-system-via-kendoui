/**
 * Mock Authorization Service 實作
 *
 * 使用本地 Mock 數據模擬後端 API 行為：
 * - 模擬網路延遲
 * - 模擬錯誤情況
 * - 本地狀態管理（CRUD 操作會實際修改記憶體中的數據）
 * - 支援分頁與搜尋
 */

import type { IAuthorizationService, ServiceConfig } from './IAuthorizationService';
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
 * 模擬網路延遲
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 模擬隨機錯誤
 */
const shouldThrowError = (errorRate: number): boolean => {
  return Math.random() < errorRate;
};

/**
 * Mock 使用者數據
 */
let mockUsers: UserDTO[] = [
  {
    id: 1,
    username: '張三',
    email: 'zhang@example.com',
    status: 'active',
    roles: ['管理員', '使用者'],
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
  },
  {
    id: 2,
    username: '李四',
    email: 'li@example.com',
    status: 'active',
    roles: ['使用者'],
    created_at: '2024-01-16',
    updated_at: '2024-01-16',
  },
  {
    id: 3,
    username: '王五',
    email: 'wang@example.com',
    status: 'inactive',
    roles: ['訪客'],
    created_at: '2024-01-17',
    updated_at: '2024-01-17',
  },
];

/**
 * Mock 角色數據
 */
let mockRoles: RoleDTO[] = [
  {
    id: 1,
    name: '管理員',
    description: '系統管理員，擁有所有權限',
    permission_count: 12,
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
  },
  {
    id: 2,
    name: '使用者',
    description: '一般使用者，基本操作權限',
    permission_count: 6,
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
  },
  {
    id: 3,
    name: '訪客',
    description: '訪客角色，僅檢視權限',
    permission_count: 2,
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
  },
];

/**
 * Mock 資源數據
 */
const mockResources: ResourceDTO[] = [
  {
    id: 1,
    name: '使用者資料',
    code: 'user.profile',
    parent_id: null,
    order: 1,
  },
  {
    id: 2,
    name: '儀表板',
    code: 'dashboard',
    parent_id: null,
    order: 2,
  },
  {
    id: 3,
    name: '報表管理',
    code: 'reports',
    parent_id: null,
    order: 3,
  },
  {
    id: 4,
    name: '系統設定',
    code: 'settings',
    parent_id: null,
    order: 4,
  },
];

/**
 * Mock 權限數據
 */
const mockPermissions: PermissionDTO[] = [
  { id: 1, resource: 'user.profile', action: 'read', description: '檢視使用者資料' },
  { id: 2, resource: 'user.profile', action: 'edit', description: '編輯使用者資料' },
  { id: 3, resource: 'dashboard', action: 'read', description: '檢視儀表板' },
  { id: 4, resource: 'reports', action: 'read', description: '檢視報表' },
  { id: 5, resource: 'reports', action: 'create', description: '建立報表' },
  { id: 6, resource: 'reports', action: 'edit', description: '編輯報表' },
  { id: 7, resource: 'reports', action: 'delete', description: '刪除報表' },
  { id: 8, resource: 'settings', action: 'read', description: '檢視系統設定' },
  { id: 9, resource: 'settings', action: 'edit', description: '編輯系統設定' },
];

/**
 * Mock 角色權限對應表
 */
const mockRolePermissions = new Map<number, number[]>([
  [1, [1, 2, 3, 4, 5, 6, 7, 8, 9]], // 管理員擁有所有權限
  [2, [1, 3, 4, 5, 6]], // 使用者
  [3, [3, 4]], // 訪客
]);

/**
 * Mock Authorization Service 實作類別
 */
export class MockAuthorizationService implements IAuthorizationService {
  private config: Required<ServiceConfig>;
  private nextUserId: number = 4;
  private nextRoleId: number = 4;

  constructor(config?: Partial<ServiceConfig>) {
    this.config = {
      useMock: true,
      mockDelay: config?.mockDelay ?? 300,
      mockErrorRate: config?.mockErrorRate ?? 0,
      baseUrl: config?.baseUrl ?? '',
    };
  }

  /**
   * 模擬 API 延遲與錯誤
   */
  private async simulateApiCall<T>(operation: () => T): Promise<T> {
    await delay(this.config.mockDelay);

    if (shouldThrowError(this.config.mockErrorRate)) {
      throw new Error('Mock API Error: 模擬的網路錯誤');
    }

    return operation();
  }

  // ==================== 使用者相關 ====================

  async getUsers(params: PaginationQuery = {}): Promise<PaginatedResponse<UserDTO>> {
    return this.simulateApiCall(() => {
      let filteredUsers = [...mockUsers];

      // 模擬關鍵字搜尋
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user =>
            user.username.toLowerCase().includes(keyword) ||
            user.email?.toLowerCase().includes(keyword)
        );
      }

      // 模擬分頁
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filteredUsers.slice(start, end);
      const totalPages = Math.ceil(filteredUsers.length / pageSize);

      return {
        data: paginatedData,
        total: filteredUsers.length,
        page,
        pageSize,
        totalPages,
      };
    });
  }

  async createUser(data: Partial<UserDTO>): Promise<UserDTO> {
    return this.simulateApiCall(() => {
      const newUser: UserDTO = {
        id: this.nextUserId++,
        username: data.username || '',
        email: data.email,
        status: data.status || 'active',
        roles: data.roles || [],
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
      };

      mockUsers.push(newUser);
      return newUser;
    });
  }

  async updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO> {
    return this.simulateApiCall(() => {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error(`使用者 ID ${id} 不存在`);
      }

      mockUsers[index] = {
        ...mockUsers[index],
        ...data,
        id, // 確保 ID 不被覆蓋
        updated_at: new Date().toISOString().split('T')[0],
      };

      return mockUsers[index];
    });
  }

  async deleteUser(id: number): Promise<{ success: boolean } | string> {
    return this.simulateApiCall(() => {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        return '使用者不存在';
      }

      mockUsers.splice(index, 1);
      return { success: true };
    });
  }

  async updateUserRoles(
    userId: number,
    payload: UpdateUserRolesPayload
  ): Promise<{ userId: number; roleIds: number[] }> {
    return this.simulateApiCall(() => {
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error(`使用者 ID ${userId} 不存在`);
      }

      // 根據 roleIds 查找角色名稱
      const roleNames = mockRoles
        .filter(r => payload.roleIds.includes(r.id))
        .map(r => r.name);

      user.roles = roleNames;
      user.updated_at = new Date().toISOString().split('T')[0];

      return {
        userId,
        roleIds: payload.roleIds,
      };
    });
  }

  // ==================== 角色相關 ====================

  async getRoles(): Promise<RoleDTO[]> {
    return this.simulateApiCall(() => {
      return [...mockRoles];
    });
  }

  async createRole(data: Partial<RoleDTO>): Promise<RoleDTO> {
    return this.simulateApiCall(() => {
      const newRole: RoleDTO = {
        id: this.nextRoleId++,
        name: data.name || '',
        description: data.description,
        permission_count: 0,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
      };

      mockRoles.push(newRole);
      mockRolePermissions.set(newRole.id, []);
      return newRole;
    });
  }

  async updateRole(id: number, data: Partial<RoleDTO>): Promise<RoleDTO> {
    return this.simulateApiCall(() => {
      const index = mockRoles.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`角色 ID ${id} 不存在`);
      }

      mockRoles[index] = {
        ...mockRoles[index],
        ...data,
        id,
        updated_at: new Date().toISOString().split('T')[0],
      };

      return mockRoles[index];
    });
  }

  async deleteRole(id: number): Promise<{ success: boolean } | string> {
    return this.simulateApiCall(() => {
      const index = mockRoles.findIndex(r => r.id === id);
      if (index === -1) {
        return '角色不存在';
      }

      // 檢查是否有使用者正在使用此角色
      const usersWithRole = mockUsers.filter(u => u.roles?.includes(mockRoles[index].name));
      if (usersWithRole.length > 0) {
        return `無法刪除：仍有 ${usersWithRole.length} 位使用者使用此角色`;
      }

      mockRoles.splice(index, 1);
      mockRolePermissions.delete(id);
      return { success: true };
    });
  }

  async getRolePermissions(roleId: number): Promise<RolePermissionsResponse> {
    return this.simulateApiCall(() => {
      const permissionIds = mockRolePermissions.get(roleId) || [];
      return {
        roleId,
        permissionIds,
      };
    });
  }

  async updateRolePermissions(
    roleId: number,
    payload: UpdateRolePermissionsPayload
  ): Promise<RolePermissionsResponse> {
    return this.simulateApiCall(() => {
      mockRolePermissions.set(roleId, payload.permissionIds);

      // 更新角色的權限數量
      const role = mockRoles.find(r => r.id === roleId);
      if (role) {
        role.permission_count = payload.permissionIds.length;
        role.updated_at = new Date().toISOString().split('T')[0];
      }

      return {
        roleId,
        permissionIds: payload.permissionIds,
      };
    });
  }

  // ==================== 資源與權限 ====================

  async getResources(): Promise<ResourceDTO[]> {
    return this.simulateApiCall(() => {
      return [...mockResources];
    });
  }

  async getPermissions(): Promise<PermissionDTO[]> {
    return this.simulateApiCall(() => {
      return [...mockPermissions];
    });
  }

  // ==================== 認證相關 ====================

  async getAuthMe(): Promise<AuthMeDTO> {
    return this.simulateApiCall(() => {
      // 模擬當前登入使用者為 ID 1 的管理員
      const currentUser = mockUsers[0];
      const roleIds = mockRoles
        .filter(r => currentUser.roles?.includes(r.name))
        .map(r => r.id);

      // 收集所有角色的權限
      const permissionIds = new Set<number>();
      roleIds.forEach(roleId => {
        const permissions = mockRolePermissions.get(roleId) || [];
        permissions.forEach(pid => permissionIds.add(pid));
      });

      const permissions = mockPermissions
        .filter(p => permissionIds.has(p.id))
        .map(p => `${p.resource}:${p.action}`);

      return {
        id: currentUser.id,
        username: currentUser.username,
        roleIds,
        permissions,
      };
    });
  }
}

/**
 * 重置 Mock 數據（用於測試）
 */
export function resetMockData(): void {
  mockUsers = [
    {
      id: 1,
      username: '張三',
      email: 'zhang@example.com',
      status: 'active',
      roles: ['管理員', '使用者'],
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
    {
      id: 2,
      username: '李四',
      email: 'li@example.com',
      status: 'active',
      roles: ['使用者'],
      created_at: '2024-01-16',
      updated_at: '2024-01-16',
    },
    {
      id: 3,
      username: '王五',
      email: 'wang@example.com',
      status: 'inactive',
      roles: ['訪客'],
      created_at: '2024-01-17',
      updated_at: '2024-01-17',
    },
  ];

  mockRoles = [
    {
      id: 1,
      name: '管理員',
      description: '系統管理員，擁有所有權限',
      permission_count: 12,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
    },
    {
      id: 2,
      name: '使用者',
      description: '一般使用者，基本操作權限',
      permission_count: 6,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
    },
    {
      id: 3,
      name: '訪客',
      description: '訪客角色，僅檢視權限',
      permission_count: 2,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
    },
  ];
}

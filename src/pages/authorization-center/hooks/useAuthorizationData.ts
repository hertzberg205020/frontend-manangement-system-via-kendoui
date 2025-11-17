import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { User, Role, UserFormValues, RoleFormValues } from '../types';
import { MESSAGES } from '../constants';
import {
  getUsers,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  restoreUser as restoreUserApi,
  replaceUserRoles,
  getRoles,
  createRole as createRoleApi,
  updateRole as updateRoleApi,
  deleteRole as deleteRoleApi,
  replaceRolePermissions,
  type UserResponse,
  type RoleDto,
  type CreateUserRequest,
  type UpdateUserRequest,
  type CreateRoleRequest,
  type UpdateRoleRequest,
} from '@/api/auth-management';

// Helper function to convert UserResponse to User
const convertUserResponse = (userResponse: UserResponse): User => ({
  empId: userResponse.empId,
  name: userResponse.name,
  isActive: userResponse.isActive,
  roleIds: userResponse.roleIds,
  createdAt: userResponse.createdAt,
  updatedAt: userResponse.updatedAt,
});

// Helper function to convert RoleDto to Role
const convertRoleDto = (roleDto: RoleDto): Role => ({
  id: roleDto.id,
  name: roleDto.name,
  description: roleDto.description,
  permissionIds: roleDto.permissionIds,
  createdAt: roleDto.createdAt,
  updatedAt: roleDto.updatedAt,
});

export const useAuthorizationData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch users from API
  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getUsers({ page: 1, pageSize: 100 });
      const convertedUsers = response.data.data.map(convertUserResponse);
      setUsers(convertedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('獲取使用者列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles from API
  const fetchRoles = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getRoles();
      const convertedRoles = response.data.map(convertRoleDto);
      setRoles(convertedRoles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      message.error('獲取角色列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    void fetchUsers();
    void fetchRoles();
  }, []);

  // 使用者操作
  const createUser = async (values: UserFormValues): Promise<void> => {
    try {
      const createData: CreateUserRequest = {
        empId: values.empId,
        name: values.name,
        password: values.password || 'defaultPassword123', // 需要提供預設密碼或從表單取得
        roleIds: [],
      };
      await createUserApi(createData);
      message.success(MESSAGES.USER_CREATED);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      message.error('建立使用者失敗');
    }
  };

  const updateUser = async (empId: string, values: UserFormValues): Promise<void> => {
    try {
      const updateData: UpdateUserRequest = {
        name: values.name,
        isActive: values.isActive,
      };
      await updateUserApi(empId, updateData);
      message.success(MESSAGES.USER_UPDATED);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      message.error('更新使用者失敗');
    }
  };

  const deleteUser = async (empId: string): Promise<void> => {
    try {
      await deleteUserApi(empId);
      message.success(MESSAGES.USER_DELETED);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      message.error('刪除使用者失敗');
    }
  };

  const restoreUser = async (empId: string): Promise<void> => {
    try {
      await restoreUserApi(empId);
      message.success(MESSAGES.USER_RESTORED);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to restore user:', error);
      message.error('恢復使用者失敗');
    }
  };

  const assignRole = async (user: User, roleIds: number[]): Promise<void> => {
    try {
      await replaceUserRoles(user.empId, { roleIds });
      message.success('角色分配成功');
      await fetchUsers();
    } catch (error) {
      console.error('Failed to assign roles:', error);
      message.error('角色分配失敗');
    }
  };

  // 角色操作
  const createRole = async (values: RoleFormValues): Promise<void> => {
    try {
      const createData: CreateRoleRequest = {
        name: values.name,
        description: values.description,
      };
      await createRoleApi(createData);
      message.success(MESSAGES.ROLE_CREATED);
      await fetchRoles();
    } catch (error) {
      console.error('Failed to create role:', error);
      message.error('建立角色失敗');
    }
  };

  const updateRole = async (id: number, values: RoleFormValues): Promise<void> => {
    try {
      const updateData: UpdateRoleRequest = {
        name: values.name,
        description: values.description,
      };
      await updateRoleApi(id, updateData);
      message.success(MESSAGES.ROLE_UPDATED);
      await fetchRoles();
    } catch (error) {
      console.error('Failed to update role:', error);
      message.error('更新角色失敗');
    }
  };

  const deleteRole = async (id: number): Promise<void> => {
    try {
      await deleteRoleApi(id);
      message.success(MESSAGES.ROLE_DELETED);
      await fetchRoles();
    } catch (error: unknown) {
      console.error('Failed to delete role:', error);
      // 處理 HTTP 409 衝突：角色已分配給使用者
      const hasCode = (err: unknown): err is { code: number } =>
        typeof err === 'object' && err !== null && 'code' in err;
      const hasResponse = (err: unknown): err is { response: { status: number } } =>
        typeof err === 'object' && err !== null && 'response' in err;

      const errorCode = hasCode(error) ? error.code : undefined;
      const responseStatus = hasResponse(error) ? error.response?.status : undefined;

      if (errorCode === 409 || responseStatus === 409) {
        message.error('無法刪除角色，該角色已分配給一或多位使用者');
      } else if (errorCode === 404 || responseStatus === 404) {
        message.error('角色不存在');
      } else if (errorCode === 403 || responseStatus === 403) {
        message.error('無權限刪除角色');
      } else {
        message.error('刪除角色失敗');
      }
    }
  };

  const updatePermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
    try {
      await replaceRolePermissions(roleId, { permissionIds });
      message.success(MESSAGES.PERMISSION_UPDATED);
      await fetchRoles();
    } catch (error) {
      console.error('Failed to update permissions:', error);
      message.error('更新權限失敗');
    }
  };

  return {
    // 資料
    users,
    roles,
    loading,
    // 使用者操作
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
    assignRole,
    // 角色操作
    createRole,
    updateRole,
    deleteRole,
    updatePermissions,
    // Refetch functions
    refetchUsers: fetchUsers,
    refetchRoles: fetchRoles,
  };
};

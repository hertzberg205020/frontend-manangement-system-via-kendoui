import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { User, Role, UserFormValues, RoleFormValues } from '../types';
import { MESSAGES } from '../constants';
import {
  getUsers,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  replaceUserRoles,
  getRoles,
  createRole as createRoleApi,
  replaceRolePermissions,
  type UserResponse,
  type RoleDto,
  type CreateUserRequest,
  type UpdateUserRequest,
  type CreateRoleRequest,
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

  const updateRole = async (_id: number, _values: RoleFormValues): Promise<void> => {
    try {
      // Note: The API doesn't have an update role endpoint for name/description
      // We would need to fetch the role, then update it
      // For now, we'll just refetch the roles
      message.warning('角色更新功能尚未實作');
      await fetchRoles();
    } catch (error) {
      console.error('Failed to update role:', error);
      message.error('更新角色失敗');
    }
  };

  const deleteRole = async (_id: number): Promise<void> => {
    try {
      // Note: The API doesn't have a delete role endpoint
      message.warning('角色刪除功能尚未實作');
      await fetchRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
      message.error('刪除角色失敗');
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

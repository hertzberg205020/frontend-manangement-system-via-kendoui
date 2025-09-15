import { useState } from 'react';
import { message } from 'antd';
import type { User, Role, Resource, Permission, UserFormValues, RoleFormValues } from '../types';
import { getCurrentDateString, generateId } from '../utils';
import { MESSAGES } from '../constants';

export const useAuthorizationData = () => {
  // 使用者資料
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: '張三',
      emp_id: 'EMP001',
      is_active: true,
      roles: ['管理員', '使用者'],
      created_at: '2024-01-15',
    },
    {
      id: 2,
      name: '李四',
      emp_id: 'EMP002',
      is_active: true,
      roles: ['使用者'],
      created_at: '2024-01-16',
    },
    {
      id: 3,
      name: '王五',
      emp_id: 'EMP003',
      is_active: false,
      roles: ['訪客'],
      created_at: '2024-01-17',
    },
  ]);

  // 角色資料
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: '管理員',
      description: '系統管理員，擁有所有權限',
      user_count: 1,
      permission_count: 12,
      created_at: '2024-01-10',
    },
    {
      id: 2,
      name: '使用者',
      description: '一般使用者，基本操作權限',
      user_count: 2,
      permission_count: 6,
      created_at: '2024-01-10',
    },
    {
      id: 3,
      name: '訪客',
      description: '訪客角色，僅檢視權限',
      user_count: 1,
      permission_count: 2,
      created_at: '2024-01-10',
    },
  ]);

  // 資源資料
  const [resources] = useState<Resource[]>([
    { id: 1, code: 'user.profile', description: '使用者資料', is_active: true },
    { id: 2, code: 'dashboard', description: '儀表板', is_active: true },
    { id: 3, code: 'reports', description: '報表管理', is_active: true },
    { id: 4, code: 'settings', description: '系統設定', is_active: true },
  ]);

  // 權限資料
  const [permissions] = useState<Permission[]>([
    { id: 1, resource_id: 1, action: 'read', description: '檢視使用者資料' },
    { id: 2, resource_id: 1, action: 'edit', description: '編輯使用者資料' },
    { id: 3, resource_id: 2, action: 'read', description: '檢視儀表板' },
    { id: 4, resource_id: 3, action: 'read', description: '檢視報表' },
    { id: 5, resource_id: 3, action: 'create', description: '建立報表' },
    { id: 6, resource_id: 3, action: 'edit', description: '編輯報表' },
    { id: 7, resource_id: 3, action: 'delete', description: '刪除報表' },
    { id: 8, resource_id: 4, action: 'read', description: '檢視系統設定' },
    { id: 9, resource_id: 4, action: 'edit', description: '編輯系統設定' },
  ]);

  // 使用者操作
  const createUser = (values: UserFormValues): void => {
    const newUser: User = {
      id: generateId(),
      ...values,
      roles: [],
      created_at: getCurrentDateString(),
    };
    setUsers(prev => [...prev, newUser]);
    message.success(MESSAGES.USER_CREATED);
  };

  const updateUser = (id: number, values: UserFormValues): void => {
    setUsers(prev =>
      prev.map(user => (user.id === id ? { ...user, ...values } : user))
    );
    message.success(MESSAGES.USER_UPDATED);
  };

  const deleteUser = (id: number): void => {
    setUsers(prev => prev.filter(user => user.id !== id));
    message.success(MESSAGES.USER_DELETED);
  };

  // 角色操作
  const createRole = (values: RoleFormValues): void => {
    const newRole: Role = {
      id: generateId(),
      ...values,
      user_count: 0,
      permission_count: 0,
      created_at: getCurrentDateString(),
    };
    setRoles(prev => [...prev, newRole]);
    message.success(MESSAGES.ROLE_CREATED);
  };

  const updateRole = (id: number, values: RoleFormValues): void => {
    setRoles(prev =>
      prev.map(role => (role.id === id ? { ...role, ...values } : role))
    );
    message.success(MESSAGES.ROLE_UPDATED);
  };

  const deleteRole = (id: number): void => {
    setRoles(prev => prev.filter(role => role.id !== id));
    message.success(MESSAGES.ROLE_DELETED);
  };

  const assignRole = (_user: User): void => {
    message.info(MESSAGES.ROLE_ASSIGNMENT_PENDING);
  };

  const updatePermissions = (): void => {
    message.success(MESSAGES.PERMISSION_UPDATED);
  };

  return {
    // 資料
    users,
    roles,
    resources,
    permissions,
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
  };
};

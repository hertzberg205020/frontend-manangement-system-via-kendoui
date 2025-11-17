// Import API types from auth-management
import type {
  UserResponse,
  RoleDto,
  PermissionTreeNode as ApiPermissionTreeNode,
} from '@/api/auth-management';

// 使用者相關型別 - 對應後端 API
export interface User {
  empId: string;
  name: string;
  isActive: boolean;
  roleIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UserFormValues {
  empId: string;
  name: string;
  password?: string;
  isActive: boolean;
}

// 角色相關型別 - 對應後端 API
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissionIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleFormValues {
  name: string;
  description?: string;
}

// Re-export API types for convenience
export type { UserResponse, RoleDto, ApiPermissionTreeNode };

// 事件處理函數型別
export interface UserActions {
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (empId: string) => void;
  onAssignRole: (user: User) => void;
}

export interface RoleActions {
  onAdd: () => void;
  onEdit: (role: Role) => void;
  onDelete: (roleId: number) => void;
  onPermissionConfig: (role: Role) => void;
}

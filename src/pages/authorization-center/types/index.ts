// 使用者相關型別
export interface User {
  id: number;
  name: string;
  emp_id: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
}

export interface UserFormValues {
  emp_id: string;
  name: string;
  password?: string;
  is_active: boolean;
}

// 角色相關型別
export interface Role {
  id: number;
  name: string;
  description: string;
  user_count: number;
  permission_count: number;
  created_at: string;
}

export interface RoleFormValues {
  name: string;
  description: string;
}

// 權限相關型別
export interface Resource {
  id: number;
  code: string;
  description: string;
  is_active: boolean;
}

export interface Permission {
  id: number;
  resource_id: number;
  action: string;
  description: string;
}

// 權限樹狀結構型別
export interface PermissionTreeNode {
  title: string;
  key: string;
  children?: PermissionTreeNode[];
}

// 表格欄位型別
export interface TableColumn<T = unknown> {
  title: string;
  dataIndex?: string;
  key: string;
  width?: number;
  render?: (value: unknown, record: T) => React.ReactNode;
}

// 事件處理函數型別
export interface UserActions {
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onAssignRole: (user: User) => void;
}

export interface RoleActions {
  onAdd: () => void;
  onEdit: (role: Role) => void;
  onDelete: (roleId: number) => void;
  onPermissionConfig: (role: Role) => void;
}

import type { Permission } from '@/constants/permissions';

export interface MenuItemForDisplay {
  key: string;
  label: string;
  description?: string; // 用於顯示選單項目的描述
  icon?: string;
  requiredPermissions: Permission[]; // 這個選單項目需要的權限
  children?: MenuItemForDisplay[];
}

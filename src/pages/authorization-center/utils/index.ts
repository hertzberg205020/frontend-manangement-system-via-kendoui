import type { Permission, Resource, PermissionTreeNode } from '../types';
import { ACTION_TEXT_MAP } from '../constants';

/**
 * 將操作動作轉換為中文文字
 */
export const getActionText = (action: string): string => {
  return ACTION_TEXT_MAP[action] || action;
};

/**
 * 生成權限樹狀結構資料
 */
export const generatePermissionTreeData = (
  resources: Resource[],
  permissions: Permission[]
): PermissionTreeNode[] => {
  return resources.map(resource => ({
    title: resource.description,
    key: `resource-${resource.id}`,
    children: permissions
      .filter(p => p.resource_id === resource.id)
      .map(permission => ({
        title: `${getActionText(permission.action)} - ${permission.description}`,
        key: `permission-${permission.id}`,
      })),
  }));
};

/**
 * 生成當前日期字串 (YYYY-MM-DD)
 */
export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 生成唯一 ID
 */
export const generateId = (): number => {
  return Date.now();
};

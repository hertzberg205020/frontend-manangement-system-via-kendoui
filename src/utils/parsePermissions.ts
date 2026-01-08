import { PERMISSIONS } from '@/constants/permissions';
import type { Permission } from '@/constants/permissions';

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

/**
 * 把一個 raw string 解析成型別安全的 Permission[]。
 * 支援的輸入形式：
 * - JSON 陣列字串，例如 '["A","B"]'
 * - 以逗號/分號/空白/豎線分隔的字串，例如 'A,B C;D|E'
 * - 單一權限字串，例如 'A'
 *
 * 如果解析失敗或無符合的權限，會回傳空陣列。
 */
export function parsePermissions(rawPermissionList: string[]): Permission[] {
  if (!isStringArray(rawPermissionList) || rawPermissionList.length === 0) {
    return [];
  }

  const allowed = new Set<string>(Object.values(PERMISSIONS));
  const isPermission = (p: string): p is Permission => allowed.has(p);

  return rawPermissionList
    .map((t) => String(t).trim())
    .filter(Boolean)
    .filter(isPermission) as Permission[];
}

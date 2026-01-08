// src/hooks/useAuth.ts
import {
  useAppSelector,
  selectToken,
  selectPermissions,
  selectUserInfo,
  selectIsTokenExpired,
  selectIsAuthenticated,
} from '@/store';
import type { Permission } from '@/constants/permissions';

/**
 * 自定義 Hook 用於獲取身份驗證相關信息
 *
 * 這個 Hook 封裝了從 Redux store 獲取身份驗證信息的邏輯，
 * 提供了簡潔的 API 來訪問 token、permissions、用戶信息等
 */
export const useAuth = () => {
  const token = useAppSelector(selectToken);
  const permissions = useAppSelector(selectPermissions);
  const userInfo = useAppSelector(selectUserInfo);
  const isTokenExpired = useAppSelector(selectIsTokenExpired);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  /**
   * 檢查用戶是否具有特定權限
   */
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  /**
   * 檢查用戶是否具有任一權限
   */
  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some((permission) => permissions.includes(permission));
  };

  /**
   * 檢查用戶是否具有所有權限
   */
  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every((permission) => permissions.includes(permission));
  };

  return {
    // 基本信息
    token,
    permissions,
    userInfo,
    isAuthenticated,
    isTokenExpired,

    // 權限檢查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

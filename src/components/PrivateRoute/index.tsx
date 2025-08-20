// src/components/PrivateRoute/index.tsx

import React from 'react';
import { Navigate } from 'react-router';
import { useAppSelector, selectPermissions, selectToken } from '@/store';
import type { Permission } from '@/constants/permissions';
import { Result } from 'antd';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission; // 需要的權限
  allowAnonymous?: boolean; // 是否允許匿名存取
  redirectPath?: string; // 重新導向路徑
}

/**
 * PrivateRoute 元件
 *
 * 這個元件負責檢查使用者是否有權限存取特定路由。
 * 它會檢查以下條件：
 * 1. 使用者是否已登入（有 token）
 * 2. 如果需要特定權限，檢查使用者是否擁有該權限
 * 3. 根據檢查結果決定是否顯示內容、重新導向或顯示無權限頁面
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredPermission,
  allowAnonymous = false,
  redirectPath = '/login'
}) => {
  const token = useAppSelector(selectToken);
  const permissions = useAppSelector(selectPermissions);

  // 檢查是否已登入
  const isAuthenticated = Boolean(token);

  // 如果允許匿名存取且使用者已登入，重新導向到預設頁面
  if (allowAnonymous && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 如果不允許匿名存取但使用者未登入，重新導向到登入頁面
  if (!allowAnonymous && !isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // 如果需要特定權限但使用者沒有該權限，顯示無權限頁面
  if (requiredPermission && isAuthenticated) {
    const hasPermission = permissions.includes(requiredPermission);

    if (!hasPermission) {
      return (
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您沒有存取此頁面的權限。"
          extra={
            <a href="/dashboard">返回首頁</a>
          }
        />
      );
    }
  }

  // 所有檢查都通過，顯示子元件
  return <>{children}</>;
};

export default PrivateRoute;

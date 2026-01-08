import { PERMISSION_ROUTE_MAP, type Permission } from '@/constants/permissions';
import type { RouteObject } from 'react-router';
import { getRoute } from '@/router/routerMap';
import PrivateRoute from '@/components/PrivateRoute';

/**
 * 根據使用者權限生成路由
 *
 * 這個函式的設計理念：
 * 1. 遍歷使用者擁有的權限
 * 2. 為每個權限建立對應的路由
 * 3. 每個路由都包裝在 PrivateRoute 中進行權限檢查
 * 4. 只有具備相應權限的使用者才能存取特定路由
 *
 * @param permissions 使用者擁有的權限陣列
 * @returns 路由物件陣列
 */
export function generateRoutesFromPermissions(permissions: Permission[]): RouteObject[] {
  const routes: RouteObject[] = [];

  permissions.forEach((permission) => {
    const routeInfo = PERMISSION_ROUTE_MAP[permission];
    if (!routeInfo) {
      console.warn(`未找到權限 ${permission} 對應的路由資訊`);
      return;
    }

    // 從 routerMap 取得對應的元件
    const element = getRoute(routeInfo.path);
    if (!element) {
      console.warn(`未找到路徑 ${routeInfo.path} 對應的路由設定`);
      return;
    }

    // 建立包含權限檢查的路由
    const route: RouteObject = {
      path: routeInfo.path,
      element: <PrivateRoute requiredPermission={permission}>{element}</PrivateRoute>,
    };

    routes.push(route);
  });

  return routes;
}

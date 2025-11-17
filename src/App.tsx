import { createBrowserRouter, RouterProvider } from 'react-router';
import BASE_ROUTES from './router';
import { useAppDispatch, useAppSelector, selectPermissions, selectToken } from '@/store';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { RouteObject } from 'react-router';
import { Spin } from 'antd';
import { generateRoutesFromPermissions } from './router/generateRouteFromPermission';


function App() {
  const token = useAppSelector(selectToken);
  const permissions = useAppSelector(selectPermissions);
  const dispatch = useAppDispatch();

  // 路由準備狀態
  const [isRoutesReady, setIsRoutesReady] = useState<boolean>(false);
  const [routeTree, setRouteTree] = useState<RouteObject[] | null>(null);

  /**
     * 建立使用者路由的核心邏輯
     *
     * 這個函式展示了新權限系統的工作流程：
     * 1. 檢查使用者登入狀態
     * 2. 如果已登入，取得使用者權限
     * 3. 根據權限生成對應的路由
     * 4. 將權限控制的路由整合到完整的路由樹中
     */
  useEffect(() => {
    const buildUserRoutes = async () => {
      try {
        // 重設路由準備狀態
        setIsRoutesReady(false);

        if (!token) {
          setRouteTree(BASE_ROUTES);
          setIsRoutesReady(true);
          return;
        }

        // const permissions = await getUserPermissions();

        // 將權限儲存到 Redux store
        // dispatch(setPermissions(permissions));
        console.log('User permissions:', permissions);

        // 根據權限生成路由
        const userRoutes = generateRoutesFromPermissions(permissions);

        // 建立完整的路由樹
        const completeRoutes: RouteObject[] = [...BASE_ROUTES];

        // 找到根路由並加入使用者專屬路由
        const rootRouteIndex = completeRoutes.findIndex(route => route.path === '/');

        if (rootRouteIndex >= 0 && userRoutes.length > 0) {
          // 將使用者路由加入到根路由的子路由中
          completeRoutes[rootRouteIndex].children = userRoutes;

          // 設定首頁為儀表板（如果使用者有權限的話）
          const dashboardRoute = completeRoutes[rootRouteIndex].children
            ?.find(route => route.path === '/dashboard');

          if (dashboardRoute) {
            dashboardRoute.index = true;
          }
        }

        setRouteTree(completeRoutes);
      } catch (error) {
        console.error('Error fetching menu:', error);
        setRouteTree(BASE_ROUTES);
      } finally {
        setIsRoutesReady(true);
      }
    };

    buildUserRoutes();
  }, [token, dispatch, permissions]);


  const router = useMemo(() => {
    if (isRoutesReady && routeTree) {
      console.log('Final route tree:', routeTree);
      return createBrowserRouter(routeTree);
    }
    return createBrowserRouter(BASE_ROUTES);
  }, [routeTree, isRoutesReady]);

  /**
   * 載入狀態處理
   *
   * 在路由準備完成之前顯示載入指示器
   * 這提供了更好的使用者體驗，避免頁面突然跳轉或空白
   */
  if (!isRoutesReady || !router) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  /**
   * 主要渲染邏輯
   *
   * 使用 Suspense 來處理延遲載入的元件
   * 這讓我們可以實現程式碼分割，提升首次載入效能
   */
  return (
    <Suspense
      fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <Spin size="large" />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;

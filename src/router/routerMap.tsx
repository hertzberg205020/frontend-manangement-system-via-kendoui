// routerMap.tsx
import { RESOURCES } from '@/constants/permissions';
import React, { lazy } from 'react';

interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

// 用 React.lazy 動態載入各頁面
const Dashboard = lazy(() => import('@/pages/dashboard'));
const UsersList = lazy(() => import('@/pages/users'));
const AddUser = lazy(() => import('@/pages/users/add-user'));
const BuildingManagement = lazy(() => import('@/pages/property-management/tenement'));
const RoomManagement = lazy(() => import('@/pages/property-management/room'));
const VehicleManagement = lazy(() => import('@/pages/property-management/vehicle'));
const RepairManagement = lazy(() => import('@/pages/repair'));
const ContractManagement = lazy(() => import('@/pages/finance/contract'));
const ContractDetail = lazy(() => import('@/pages/finance/contract-detail'));
const BillingManagement = lazy(() => import('@/pages/finance/bill-center'));
const MerchantPortal = lazy(() => import('@/pages/leasing-hub/merchant-portal'));
const OperationsAnalytics = lazy(() => import('@/pages/operation-center/analytics'));
const ArticlePublishing = lazy(() => import('@/pages/operation-center/article'));
const ContentComments = lazy(() => import('@/pages/operation-center/comments'));
const EquipmentManagement = lazy(() => import('@/pages/equipment'));
const EnergyConsumption = lazy(() => import('@/pages/energy'));
const AuthorizationSettings = lazy(() => import('@/pages/authorization-center'));
const UserProfile = lazy(() => import('@/pages/user-profile'));

const routerMap: Record<string, RouteConfig> = {

  [RESOURCES.DASHBOARD]: {
    path: RESOURCES.DASHBOARD,
    element: <Dashboard />
  },
  [RESOURCES.TENANTS_LIST]: {
    path: RESOURCES.TENANTS_LIST,
    element: <UsersList />
  },
  [RESOURCES.TENANTS_CREATION]: {
    path: RESOURCES.TENANTS_CREATION,
    element: <AddUser />
  },
  [RESOURCES.PORTFOLIO_BUILDING]: {
    path: RESOURCES.PORTFOLIO_BUILDING,
    element: <BuildingManagement />
  },
  [RESOURCES.PORTFOLIO_SPACES]: {
    path: RESOURCES.PORTFOLIO_SPACES,
    element: <RoomManagement />
  },
  [RESOURCES.PORTFOLIO_PARKING]: {
    path: RESOURCES.PORTFOLIO_PARKING,
    element: <VehicleManagement />
  },
  [RESOURCES.REPAIR]: {
    path: RESOURCES.REPAIR,
    element: <RepairManagement />
  },
  [RESOURCES.FINANCIALS_CONTRACT]: {
    path: RESOURCES.FINANCIALS_CONTRACT,
    element: <ContractManagement />
  },
  [RESOURCES.FINANCIALS_CONTRACT_DETAIL]: {
    path: RESOURCES.FINANCIALS_CONTRACT_DETAIL,
    element: <ContractDetail />
  },
  [RESOURCES.FINANCIALS_BILLING]: {
    path: RESOURCES.FINANCIALS_BILLING,
    element: <BillingManagement />
  },
  [RESOURCES.MERCHANT_PORTAL]: {
    path: RESOURCES.MERCHANT_PORTAL,
    element: <MerchantPortal />
  },
  [RESOURCES.OPERATION_ANALYTICS]: {
    path: RESOURCES.OPERATION_ANALYTICS,
    element: <OperationsAnalytics />
  },
  [RESOURCES.OPERATION_ARTICLE]: {
    path: RESOURCES.OPERATION_ARTICLE,
    element: <ArticlePublishing />
  },
  [RESOURCES.OPERATION_COMMENTS]: {
    path: RESOURCES.OPERATION_COMMENTS,
    element: <ContentComments />
  },
  [RESOURCES.EQUIPMENT]: {
    path: RESOURCES.EQUIPMENT,
    element: <EquipmentManagement />
  },
  [RESOURCES.ENERGY]: {
    path: RESOURCES.ENERGY,
    element: <EnergyConsumption />
  },
  [RESOURCES.AUTHORIZATION_CENTER]: {
    path: RESOURCES.AUTHORIZATION_CENTER,
    element: <AuthorizationSettings />
  },
  [RESOURCES.USER_PROFILE]: {
    path: RESOURCES.USER_PROFILE,
    element: <UserProfile />
  }
};

export const getRoute = (path: string): RouteConfig | undefined => {
  return routerMap[path];
};

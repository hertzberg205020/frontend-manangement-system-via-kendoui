// routerMap.tsx
import { RESOURCES } from '@/constants/permissions';
import React, { lazy } from 'react';

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

const routerMap: Record<string, React.ReactNode> = {
  [RESOURCES.DASHBOARD]: <Dashboard />,
  [RESOURCES.TENANTS_LIST]: <UsersList />,
  [RESOURCES.TENANTS_CREATION]: <AddUser />,
  [RESOURCES.PORTFOLIO_BUILDING]: <BuildingManagement />,
  [RESOURCES.PORTFOLIO_SPACES]: <RoomManagement />,
  [RESOURCES.PORTFOLIO_PARKING]: <VehicleManagement />,
  [RESOURCES.REPAIR]: <RepairManagement />,
  [RESOURCES.FINANCIALS_CONTRACT]: <ContractManagement />,
  [RESOURCES.FINANCIALS_CONTRACT_DETAIL]: <ContractDetail />,
  [RESOURCES.FINANCIALS_BILLING]: <BillingManagement />,
  [RESOURCES.MERCHANT_PORTAL]: <MerchantPortal />,
  [RESOURCES.OPERATION_ANALYTICS]: <OperationsAnalytics />,
  [RESOURCES.OPERATION_ARTICLE]: <ArticlePublishing />,
  [RESOURCES.OPERATION_COMMENTS]: <ContentComments />,
  [RESOURCES.EQUIPMENT]: <EquipmentManagement />,
  [RESOURCES.ENERGY]: <EnergyConsumption />,
  [RESOURCES.AUTHORIZATION_CENTER]: <AuthorizationSettings />,
  [RESOURCES.USER_PROFILE]: <UserProfile />,
};

export const getRoute = (path: string): React.ReactNode | undefined => {
  return routerMap[path];
};

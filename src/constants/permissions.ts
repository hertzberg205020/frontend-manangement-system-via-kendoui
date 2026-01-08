// src/constants/permissions.ts

export const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard.read',
  TENANTS_READ: 'tenants.read',
  TENANTS_CREATE: 'tenants.create',
  PORTFOLIO_BUILDING_READ: 'portfolio.buildings.read',
  PORTFOLIO_SPACES_READ: 'portfolio.spaces.read',
  PORTFOLIO_PARKING_READ: 'portfolio.parking.read',
  REPAIR_READ: 'repair.read',
  FINANCIALS_CONTRACT_READ: 'financials.contract.read',
  FINANCIALS_CONTRACT_DETAIL_READ: 'financials.contract-detail.read',
  FINANCIALS_BILLING_READ: 'financials.billing.read',
  MERCHANT_PORTAL_READ: 'merchant-portal.read',
  OPERATION_ANALYTICS_READ: 'operation-center.analytics.read',
  OPERATION_ARTICLE_READ: 'operation-center.article.read',
  OPERATION_COMMENTS_READ: 'operation-center.comments.read',
  EQUIPMENT_READ: 'equipment.read',
  ENERGY_READ: 'energy.read',
  AUTHORIZATION_CENTER_READ: 'authorization-center.read',
  USER_PROFILE_READ: 'user-profile.read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Centralized route path constants for the application.
 *
 * @remarks
 * This constant defines all route paths used in the application,
 * ensuring consistency and making path management easier.
 */
export const RESOURCES = {
  DASHBOARD: '/dashboard',
  TENANTS: '/tenants',
  TENANTS_LIST: '/tenants/list',
  TENANTS_CREATION: '/tenants/creation',
  PORTFOLIO: '/portfolio',
  PORTFOLIO_BUILDING: '/portfolio/building',
  PORTFOLIO_SPACES: '/portfolio/spaces',
  PORTFOLIO_PARKING: '/portfolio/parking',
  REPAIR: '/repair',
  FINANCIALS: '/financials',
  FINANCIALS_CONTRACT: '/financials/contract',
  FINANCIALS_CONTRACT_DETAIL: '/financials/contract-detail',
  FINANCIALS_BILLING: '/financials/billing',
  MERCHANT_PORTAL: '/merchant-portal',
  OPERATION_CENTER: '/operation-center',
  OPERATION_ANALYTICS: '/operation-center/analytics',
  OPERATION_ARTICLE: '/operation-center/article',
  OPERATION_COMMENTS: '/operation-center/comments',
  EQUIPMENT: '/equipment',
  ENERGY: '/energy',
  AUTHORIZATION_CENTER: '/authorization-center',
  USER_PROFILE: '/user-profile',
} as const;

/**
 * Describes route and menu information for a permission.
 *
 * @property path - Route path for React Router.
 * @property label - Display name for menu or navigation.
 * @property description - Feature description for UI or documentation.
 * @property icon - Ant Design icon name (optional).
 * @property parentPath - Parent route path for nested menus (optional).
 */
export interface RouteInfo {
  path: string;
  label: string;
  description: string;
  icon?: string;
  parentPath?: string;
}

/**
 * Maps each Permission to its corresponding RouteInfo.
 *
 * @remarks
 * This mapping centralizes all route and menu information for
 * permission-based navigation and UI construction.
 *
 * @structure
 * Each Permission key maps to a RouteInfo object:
 *   - {@link RouteInfo.path} — Route path for React Router
 *   - {@link RouteInfo.label} — Menu display name
 *   - {@link RouteInfo.description} — Feature description
 *   - {@link RouteInfo.icon} — Ant Design icon name (optional)
 *   - {@link RouteInfo.parentPath} — Parent route path for nested menus (optional)
 *
 * @usage
 * - Dynamically build routes and menus based on user permissions.
 * - Support direct access to hidden pages (e.g., edit/detail pages).
 * - Allow routes to carry parameters (URL params, query strings, state).
 *
 * @design
 * - Separation of concerns: Permissions only determine accessible routes.
 *   UI structure is controlled by the frontend.
 * - Extensible and maintainable: Add or modify permissions/routes by updating this map.
 * - Consistency: Centralized management reduces duplication and ensures uniformity.
 */
export const PERMISSION_ROUTE_MAP: Record<Permission, RouteInfo> = {
  [PERMISSIONS.DASHBOARD_READ]: {
    path: RESOURCES.DASHBOARD,
    label: 'Dashboard',
    description: '儀表板',
    icon: 'DashboardOutlined',
  },
  [PERMISSIONS.TENANTS_READ]: {
    path: RESOURCES.TENANTS_LIST,
    label: 'Tenant List',
    description: '客戶列表',
    icon: 'UnorderedListOutlined',
    parentPath: RESOURCES.TENANTS,
  },
  [PERMISSIONS.TENANTS_CREATE]: {
    path: RESOURCES.TENANTS_CREATION,
    label: 'Add Tenant',
    description: '新增客戶',
    icon: 'UserAddOutlined',
    parentPath: RESOURCES.TENANTS,
  },
  [PERMISSIONS.PORTFOLIO_BUILDING_READ]: {
    path: RESOURCES.PORTFOLIO_BUILDING,
    label: 'Building Management',
    description: '大樓管理',
    icon: 'InsertRowLeftOutlined',
    parentPath: RESOURCES.PORTFOLIO,
  },
  [PERMISSIONS.PORTFOLIO_SPACES_READ]: {
    path: RESOURCES.PORTFOLIO_SPACES,
    label: 'Room Management',
    description: '房間管理',
    icon: 'BankOutlined',
    parentPath: RESOURCES.PORTFOLIO,
  },
  [PERMISSIONS.PORTFOLIO_PARKING_READ]: {
    path: RESOURCES.PORTFOLIO_PARKING,
    label: 'Vehicle Information',
    description: '車輛管理',
    icon: 'TruckOutlined',
    parentPath: RESOURCES.PORTFOLIO,
  },
  [PERMISSIONS.REPAIR_READ]: {
    path: RESOURCES.REPAIR,
    label: 'Repair Management',
    description: '修復管理',
    icon: 'ToolOutlined',
  },
  [PERMISSIONS.FINANCIALS_CONTRACT_READ]: {
    path: RESOURCES.FINANCIALS_CONTRACT,
    label: 'Contract Management',
    description: '合約管理',
    icon: 'ProfileOutlined',
    parentPath: RESOURCES.FINANCIALS,
  },
  [PERMISSIONS.FINANCIALS_CONTRACT_DETAIL_READ]: {
    path: RESOURCES.FINANCIALS_CONTRACT_DETAIL,
    label: 'Contract Detail',
    description: '合約明細',
    icon: 'FrownOutlined',
    parentPath: RESOURCES.FINANCIALS,
  },
  [PERMISSIONS.FINANCIALS_BILLING_READ]: {
    path: RESOURCES.FINANCIALS_BILLING,
    label: 'Billing Management',
    description: '收費管理',
    icon: 'FileTextOutlined',
    parentPath: RESOURCES.FINANCIALS,
  },
  [PERMISSIONS.MERCHANT_PORTAL_READ]: {
    path: RESOURCES.MERCHANT_PORTAL,
    label: 'Leasing Hub',
    description: '招商管理',
    icon: 'TransactionOutlined',
  },
  [PERMISSIONS.OPERATION_ANALYTICS_READ]: {
    path: RESOURCES.OPERATION_ANALYTICS,
    label: 'Operations Overview',
    description: '運營概覽',
    icon: 'FundViewOutlined',
    parentPath: RESOURCES.OPERATION_CENTER,
  },
  [PERMISSIONS.OPERATION_ARTICLE_READ]: {
    path: RESOURCES.OPERATION_ARTICLE,
    label: 'Article Publishing',
    description: '文章發布',
    icon: 'ReadOutlined',
    parentPath: RESOURCES.OPERATION_CENTER,
  },
  [PERMISSIONS.OPERATION_COMMENTS_READ]: {
    path: RESOURCES.OPERATION_COMMENTS,
    label: 'Content Comments',
    description: '內容評論',
    icon: 'CommentOutlined',
    parentPath: RESOURCES.OPERATION_CENTER,
  },
  [PERMISSIONS.EQUIPMENT_READ]: {
    path: RESOURCES.EQUIPMENT,
    label: 'Equipment Management',
    description: '設備管理',
    icon: 'ToolOutlined',
  },
  [PERMISSIONS.ENERGY_READ]: {
    path: RESOURCES.ENERGY,
    label: 'Energy Consumption',
    description: '能耗管理',
    icon: 'ThunderboltOutlined',
  },
  [PERMISSIONS.AUTHORIZATION_CENTER_READ]: {
    path: RESOURCES.AUTHORIZATION_CENTER,
    label: 'Authorization Settings',
    description: '權限管理',
    icon: 'SettingOutlined',
  },
  [PERMISSIONS.USER_PROFILE_READ]: {
    path: RESOURCES.USER_PROFILE,
    label: 'User Profile',
    description: '個人資訊',
    icon: 'UserOutlined',
  },
};

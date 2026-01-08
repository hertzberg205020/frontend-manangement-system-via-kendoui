import {
  PERMISSION_ROUTE_MAP,
  type Permission,
  PERMISSIONS,
  RESOURCES,
} from '@/constants/permissions';
import type { MenuItemForDisplay } from '@/types/MenuItemForDisplay';

// 選單項目介面（用於側邊選單顯示）

export const MENU_NODES: MenuItemForDisplay[] = [
  {
    key: RESOURCES.DASHBOARD,
    label: 'Dashboard',
    description: '儀表板',
    icon: 'DashboardOutlined',
    requiredPermissions: [PERMISSIONS.DASHBOARD_READ],
  },
  {
    key: RESOURCES.TENANTS,
    label: 'Tenants',
    icon: 'UserOutlined',
    requiredPermissions: [],
    children: [
      {
        key: RESOURCES.TENANTS_LIST,
        label: 'Tenant List',
        description: '客戶列表',
        icon: 'UnorderedListOutlined',
        requiredPermissions: [PERMISSIONS.TENANTS_READ],
      },
      {
        key: RESOURCES.TENANTS_CREATION,
        label: 'Create Tenant',
        description: '新增客戶',
        icon: 'UserAddOutlined',
        requiredPermissions: [PERMISSIONS.TENANTS_CREATE],
      },
    ],
  },
  {
    key: RESOURCES.PORTFOLIO,
    label: 'Portfolio Management',
    description: '物業管理',
    icon: 'LaptopOutlined',
    requiredPermissions: [],
    children: [
      {
        key: RESOURCES.PORTFOLIO_BUILDING,
        label: 'Building Management',
        description: '大樓管理',
        icon: 'InsertRowLeftOutlined',
        requiredPermissions: [PERMISSIONS.PORTFOLIO_BUILDING_READ],
      },
      {
        key: RESOURCES.PORTFOLIO_SPACES,
        label: 'Spaces Management',
        description: '房間管理',
        icon: 'BankOutlined',
        requiredPermissions: [PERMISSIONS.PORTFOLIO_SPACES_READ],
      },
      {
        key: RESOURCES.PORTFOLIO_PARKING,
        label: 'Vehicle Information',
        description: '車輛管理',
        icon: 'TruckOutlined',
        requiredPermissions: [PERMISSIONS.PORTFOLIO_PARKING_READ],
      },
    ],
  },
  {
    key: RESOURCES.REPAIR,
    label: 'Repair Management',
    description: '修復管理',
    icon: 'ToolOutlined',
    requiredPermissions: [PERMISSIONS.REPAIR_READ],
  },
  {
    key: RESOURCES.FINANCIALS,
    label: 'Financial Management',
    icon: 'DollarOutlined',
    requiredPermissions: [],
    children: [
      {
        key: RESOURCES.FINANCIALS_CONTRACT,
        label: 'Contract Management',
        description: '合約管理',
        icon: 'ProfileOutlined',
        requiredPermissions: [PERMISSIONS.FINANCIALS_CONTRACT_READ],
      },
      {
        key: RESOURCES.FINANCIALS_CONTRACT_DETAIL,
        label: 'Contract Detail',
        description: '合約明細',
        icon: 'FrownOutlined',
        requiredPermissions: [PERMISSIONS.FINANCIALS_CONTRACT_DETAIL_READ],
      },
      {
        key: RESOURCES.FINANCIALS_BILLING,
        label: 'Billing Management',
        description: '帳單管理',
        icon: 'FileTextOutlined',
        requiredPermissions: [PERMISSIONS.FINANCIALS_BILLING_READ],
      },
    ],
  },
  {
    key: RESOURCES.MERCHANT_PORTAL,
    label: 'Merchant Portal',
    description: '商家入口網站',
    icon: 'TransactionOutlined',
    requiredPermissions: [PERMISSIONS.MERCHANT_PORTAL_READ],
  },
  {
    key: RESOURCES.OPERATION_CENTER,
    label: 'Operation Center',
    icon: 'FundProjectionScreenOutlined',
    requiredPermissions: [],
    children: [
      {
        key: RESOURCES.OPERATION_ANALYTICS,
        label: 'Operations Analytics',
        description: '運營分析',
        icon: 'FundViewOutlined',
        requiredPermissions: [PERMISSIONS.OPERATION_ANALYTICS_READ],
      },
      {
        key: RESOURCES.OPERATION_ARTICLE,
        label: 'Article Publishing',
        description: '文章發布',
        icon: 'ReadOutlined',
        requiredPermissions: [PERMISSIONS.OPERATION_ARTICLE_READ],
      },
      {
        key: RESOURCES.OPERATION_COMMENTS,
        label: 'Content Comments',
        description: '內容評論管理',
        icon: 'CommentOutlined',
        requiredPermissions: [PERMISSIONS.OPERATION_COMMENTS_READ],
      },
    ],
  },
  {
    key: RESOURCES.EQUIPMENT,
    label: 'Equipment Management',
    description: '設備管理系統',
    icon: 'SettingOutlined',
    requiredPermissions: [PERMISSIONS.EQUIPMENT_READ],
  },
  {
    key: RESOURCES.ENERGY,
    label: 'Energy Consumption',
    description: '能源消耗管理',
    icon: 'ThunderboltOutlined',
    requiredPermissions: [PERMISSIONS.ENERGY_READ],
  },
  {
    key: RESOURCES.AUTHORIZATION_CENTER,
    label: 'Authorization Center',
    description: '授權中心',
    icon: 'SettingOutlined',
    requiredPermissions: [PERMISSIONS.AUTHORIZATION_CENTER_READ],
  },
  {
    key: RESOURCES.USER_PROFILE,
    label: 'User Profile',
    description: '個人資料',
    icon: 'UserOutlined',
    requiredPermissions: [PERMISSIONS.USER_PROFILE_READ],
  },
];

/**
 * 根據使用者權限生成選單結構
 *
 * 這個函式的作用：
 * 1. 將扁平的權限陣列轉換為層級選單結構
 * 2. 自動組織父子選單關係
 * 3. 只顯示使用者有權限存取的選單項目
 *
 * 演算法說明：
 * 1. 先建立所有葉子節點（實際頁面）
 * 2. 然後建立父級節點，並將相關的子節點歸納到其下
 * 3. 最後整理出完整的層級結構
 *
 * @param permissions 使用者擁有的權限陣列
 * @returns 選單項目陣列
 */
export function generateMenuFromPermissions(permissions: Permission[]): MenuItemForDisplay[] {
  // 遞迴處理 MENU_NODES，過濾沒有權限的選單
  function filterMenu(menuList: MenuItemForDisplay[]): MenuItemForDisplay[] {
    // 如果沒有傳入選單，直接返回空陣列
    if (!menuList || !Array.isArray(menuList) || menuList.length === 0) {
      return [];
    }

    return menuList.reduce<MenuItemForDisplay[]>((acc, item) => {
      // 處理子選單（先遞迴過濾子選單）
      let children: MenuItemForDisplay[] = [];

      if (item.children) {
        children = filterMenu(item.children);
      }

      // 判斷這個選單項目是否有權限
      const hasMenuPermission =
        item.requiredPermissions.length > 0 && // 有明確權限要求
        item.requiredPermissions.some((p) => permissions.includes(p));

      // 判斷要不要顯示這個節點
      // 1. 如果有明確的權限要求且用戶有權限，顯示
      // 2. 如果沒有權限要求（父節點）但有可訪問的子節點，顯示
      // 3. 其他情況不顯示
      const shouldShow =
        hasMenuPermission || // 有權限
        (item.requiredPermissions.length === 0 && children.length > 0); // 無權限要求的父節點，但有可用子選單

      if (shouldShow) {
        acc.push({
          ...item,
          // 若有 children 才傳回
          ...(children.length > 0 ? { children } : {}),
        });
      }
      return acc;
    }, []);
  }

  return filterMenu(MENU_NODES);
}

// 依據 permission 查出對應的路由資訊
export function getRouteInfoByPermission(permission: Permission) {
  return PERMISSION_ROUTE_MAP[permission];
}

/**
 * 檢查使用者是否具有特定權限
 *
 * 這是一個實用函式，可以在元件中使用來控制 UI 元素的顯示
 *
 * @param userPermissions 使用者擁有的權限陣列
 * @param requiredPermission 需要檢查的權限
 * @returns 是否具有權限
 */
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * 檢查使用者是否具有任一權限
 *
 * 在某些情況下，使用者只需要具備多個權限中的任何一個即可
 *
 * @param userPermissions 使用者擁有的權限陣列
 * @param requiredPermissions 需要檢查的權限陣列
 * @returns 是否具有任一權限
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

/**
 * 檢查使用者是否具有所有權限
 *
 * 在某些情況下，使用者需要具備所有指定的權限才能執行操作
 *
 * @param userPermissions 使用者擁有的權限陣列
 * @param requiredPermissions 需要檢查的權限陣列
 * @returns 是否具有所有權限
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((permission) => userPermissions.includes(permission));
}

import { Menu } from 'antd';
import { useEffect, useState } from 'react';
import icons from './icons';
import logo from '@/assets/logo.png';
import './index.scss';
import { useAppDispatch, useAppSelector, selectPermissions, selectToken } from '@/store';
import { useLocation, useNavigate } from 'react-router';
import { addTab } from '@/store/tabs/tabsSlice';
import {
  generateMenuFromPermissions,
  type MenuItemForDisplay, menuNodes
} from '@/utils/permissionRouteGenerator.tsx';

/**
 * Antd Menu 元件使用的選單項目格式
 * 這與我們的 MenuItemForDisplay 介面略有不同，需要進行轉換
 */
interface AntdMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode | null;
  children?: AntdMenuItem[] | null;
}


interface NavSidebarProps {
  collapsed: boolean;
}

/**
 * 將選單格式轉換為 Antd Menu 元件需要的格式
 *
 * 這個轉換函式的設計考量：
 * 1. 保持原有的圖示系統相容性
 * 2. 處理巢狀選單結構
 * 3. 確保所有必要的屬性都正確對映
 */
function convertToAntdMenuItem(nodes: MenuItemForDisplay[]): AntdMenuItem[] {
  return nodes.map((node) => {
    const { key, label, icon, children } = node;

    const antdMenuItem: AntdMenuItem = {
      key,
      label,
      icon: icon ? icons[icon] : null, // 從圖示對映中取得對應的 React 元件
      children: (children && children.length > 0) ? convertToAntdMenuItem(children) : null,
    };

    return antdMenuItem;
  });
}

/**
 * 根據路徑查找選單項目資訊
 *
 * 重構說明：
 * 在新的權限系統中，我們不再從 menuList 中查找，
 * 而是直接從權限路由對映表中取得資訊。
 * 這種方式更加直接且可靠。
 */
function findMenuItemInfoByPath(path: string, nodes: MenuItemForDisplay[]): {
  key: string;
  label: string;
  description: string;
} {
  // 依據 menuNodes 中的路由資訊查找對應的選單項目
  if (!path) {
    throw new Error('路徑不能為空');
  }

  // 走訪權限路由對映表，查找對應的路由資訊
  for (const node of nodes) {
    if (node.key === path) {
      return {
        key: node.key,
        label: node.label,
        description: node.description || ''
      };
    }

    if (path.startsWith(node.key) && node.children && node.children.length > 0) {
      // 如果當前節點有子節點，遞迴查找
      const childResult = findMenuItemInfoByPath(path, node.children);
      if (childResult) {
        return childResult;
      }
    }
  }


  throw new Error('找不到對應的選單項目資訊');
}


/**
 * 1. 從使用 menuList 改為使用 permissions
 * 2. 動態生成選單結構而非直接使用後端資料
 * 3. 更強的類型安全性和錯誤處理
 * @param collapsed
 * @constructor
 */
const NavSidebar: React.FC<NavSidebarProps> = ({ collapsed }) => {
  const [menuTree, setMenuTree] = useState<AntdMenuItem[]>([]);
  // 從 Redux store 取得使用者權限
  const permissions = useAppSelector(selectPermissions);
  const token = useAppSelector(selectToken);
  const { activeKey } = useAppSelector(state => state.tabsSlice);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 處理選單項目點擊事件
   *
   * 這個函式的責任：
   * 1. 查找被點擊的選單項目資訊
   * 2. 建立新的標籤頁（如果需要）
   * 3. 導航到對應的路由
   *
   * 錯誤處理說明：
   * 如果找不到選單項目資訊，我們會記錄警告但仍然嘗試導航，
   * 這確保了即使資料不完整，基本功能仍能運作。
   */
  const handleMenuItemClick = ({ key }: { key: string }) => {
    try {
      // 查找選單項目資訊
      const menuItemInfo = findMenuItemInfoByPath(key, menuNodes);

      if (menuItemInfo) {
        // 建立新標籤頁
        dispatch(addTab({
          key: menuItemInfo.key,
          label: menuItemInfo.label,
          closable: menuItemInfo.key !== '/dashboard' // 首頁不可關閉
        }));
      } else {
        console.warn(`找不到路徑 ${key} 對應的選單項目資訊`);
      }

      // 導航到對應路由
      navigate(key);
    } catch (error) {
      console.error('處理選單點擊時發生錯誤:', error);
      // 即使發生錯誤，仍然嘗試導航
      navigate(key);
    }
  };


  /**
   * 根據使用者權限生成選單
   *
   * 這個 useEffect 展示了新權限系統的選單生成流程：
   * 1. 監聽權限變化
   * 2. 根據權限生成選單結構
   * 3. 轉換為 Antd Menu 元件需要的格式
   * 4. 更新選單顯示
   *
   * 依賴陣列說明：
   * - permissions: 權限變化時需要重新生成選單
   * - token: 登入狀態變化時需要重設選單
   */
  useEffect(() => {
    try {
      // 檢查是否有權限資料
      if (!permissions || permissions.length === 0) {
        setMenuTree([]);
        return;
      }

      // 根據權限生成選單結構
      const menuStructure = generateMenuFromPermissions(permissions);

      // 轉換為 Antd Menu 格式
      const antdMenuItems = convertToAntdMenuItem(menuStructure);

      // 更新選單樹
      setMenuTree(antdMenuItems);

      console.log('選單已根據權限更新', {
        permissions: permissions.length,
        menuItems: antdMenuItems.length
      });

    } catch (error) {
      console.error('生成選單時發生錯誤:', error);
      // 發生錯誤時清空選單
      setMenuTree([]);
    }
  }, [permissions, token]);

  /**
   * 選單元件渲染
   *
   * 渲染邏輯保持與原版本相同，但現在使用的是
   * 根據權限動態生成的選單資料。
   */
  return (
    <div className='nav-left'>
      <div className="logo">
        <img src={logo} alt='Smart Park' width={18} />
        {!collapsed && <h1>Smart</h1>}
      </div>
      <Menu
        defaultSelectedKeys={['/dashboard']}
        selectedKeys={[activeKey || location.pathname]}
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        items={menuTree}
        onClick={handleMenuItemClick}
      />
    </div>
  );
};

export default NavSidebar;

import { useAppDispatch } from '@/store';
import { addTab, setActiveTab } from '@/store/tabs/tabsSlice';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { MENU_NODES } from '@/utils/menuItemsGenerator.ts';
import type { MenuItemForDisplay } from '@/types/MenuItemForDisplay';

function findMenuItemByKey(menuList: MenuItemForDisplay[], key: string): MenuItemForDisplay | null {
  for (const item of menuList) {
    if (item.key === key) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemByKey(item.children, key);
      if (found) return found;
    }
  }
  return null;
}

export const useRouteSync = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  // 監聽路由變化，自動建立/切換 Tab
  useEffect(() => {
    const currentPath = location.pathname;

    const menuItem = findMenuItemByKey(MENU_NODES, currentPath);

    // 當 activeKey 變化時，tabsManager 會自動導航到對應的路由
    // navigate 的職責為 tabsManager
    if (menuItem) {
      dispatch(addTab({
        key: menuItem.key,
        label: menuItem.label,
        closable: menuItem.key !== '/dashboard'
      }));
    } else {
      console.warn(`No menu item found for path: ${currentPath}`);
      // 預設切換到儀表板
      dispatch(setActiveTab('/dashboard'));
    }
  }, [location.pathname, dispatch]);
};

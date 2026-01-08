import { useAppSelector } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { Breadcrumb } from 'antd';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import type { MenuItemForDisplay } from '@/types/MenuItemForDisplay';
import { MENU_NODES } from '@/utils/menuItemsGenerator';

const _recursiveFind = (path: string, data: MenuItemForDisplay[]): string[] => {
  if (!path || path.trim() === '') {
    return [];
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  for (const item of data) {
    if (path.startsWith(item.key)) {
      // pathSegments.push(item.label);
      if (item.children && item.children.length > 0) {
        const childPath = _recursiveFind(path, item.children);
        if (childPath.length > 0) {
          return [item.label, ...childPath];
        }
      } else {
        return [item.label];
      }
    }
  }
  return [];
};

const CustomBreadcrumb: React.FC = () => {
  const location = useLocation();
  const { permissions } = useAuth();
  const { activeKey } = useAppSelector((state) => state.tabsSlice);
  const cacheRef = useRef<Map<string, string[]>>(new Map());

  const findBreadcrumbPath = (path: string, data: MenuItemForDisplay[]): string[] => {
    if (!path || path.trim() === '') {
      return [];
    }

    // Check if the path is already cached
    // If the path is already in the cache, return it
    if (cacheRef.current.has(path) && cacheRef.current.get(path)) {
      return cacheRef.current.get(path) || [];
    }
    // If the path is not in the cache, find it recursively
    const breadcrumbPath = _recursiveFind(path, data);
    // set the result in the cache
    cacheRef.current.set(path, breadcrumbPath);

    // Return the breadcrumb path
    return breadcrumbPath;
  };

  useEffect(() => {
    // Clear the cache when the component mounts
    cacheRef.current.clear();
  }, [permissions]);

  const currentPath = activeKey || location.pathname;
  const labels = findBreadcrumbPath(currentPath, MENU_NODES);
  const items = labels.map((e) => ({ title: e }));

  return <Breadcrumb items={items} className="mt mb" />;
};

export default CustomBreadcrumb;

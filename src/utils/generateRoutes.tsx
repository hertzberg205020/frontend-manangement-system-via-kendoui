import { getRoute } from '@/router/routerMap';
import type { RouteObject } from 'react-router';

export interface MenuNode {
  key: string;
  label: string;
  children?: MenuNode[];
}

/**
 * Generates a list of routes based on the provided menu items.
 * Only the leaf nodes (items without children) are added to the routes.
 *
 * @param {MenuNode[] | undefined} menuItems - The menu items to generate routes from.
 * @returns {RouteObject[]} - The generated routes.
 */
export function generateRoutes(menuItems: MenuNode[] | undefined): RouteObject[] {

  const routes: RouteObject[] = [];

  // only the leaf nodes are added to the routes
  if (menuItems && menuItems.length > 0) {
    // only the leaf nodes are added to the routes
    for (const item of menuItems) {
      const hasChildren = item.children && item.children.length > 0;

      const isLeafNode = !hasChildren;

      if (isLeafNode) {
        const node: RouteObject = {
          path: item.key,
          element: getRoute(item.key)
        };

        routes.push(node);
      } else {
        routes.push(...generateRoutes(item.children));
      }
    }
  }

  return routes;
}

/**
 * @fileoverview Auth Management API - Handles authentication and user management endpoints
 * @module api/auth-management
 * @since 1.0.0
 */

import { get } from '@/utils/http/request';
import type { ApiResponse } from '@/utils/http/request';

/**
 * User response data from the auth API
 * @interface UserResponse
 * @since 1.0.0
 */
export interface UserResponse {
  /** User's full name */
  name: string;
  /** Employee ID (format: alphanumeric string) */
  empId: string;
  /** Timestamp when the user was created (ISO 8601 format) */
  createdAt: string;
  /** Timestamp when the user was last updated (ISO 8601 format) */
  updatedAt: string;
}

/**
 * Retrieve user information by employee ID
 *
 * Fetches detailed information about a specific user using their employee ID.
 * Only returns information for active users in the system.
 *
 * @param empId - The employee ID to search for. Must be a valid, non-empty
 *   string representing an existing employee.
 * @returns Promise resolving to ApiResponse containing UserResponse data
 * @throws {HttpError} 404 - User not found (the specified employee ID doesn't
 *   exist or the user is inactive)
 * @throws {HttpError} 401 - Unauthorized (authentication required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions)
 *
 * @example
 * ```typescript
 * // Fetch user by employee ID
 * try {
 *   const response = await getUserByEmpId('EMP001');
 *   console.log('User name:', response.data.name);
 *   console.log('Created at:', response.data.createdAt);
 * } catch (error) {
 *   if (error.code === 404) {
 *     console.error('User not found');
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 * @see {@link https://api.example.com/swagger OpenAPI Specification}
 */
export function getUserByEmpId(empId: string): Promise<ApiResponse<UserResponse>> {
  return get<UserResponse>(`/api/auth/${empId}`);
}

/**
 * Permission tree node representing a hierarchical permission structure
 * @interface PermissionTreeNode
 * @since 1.0.0
 */
export interface PermissionTreeNode {
  /** Unique key for the tree node (e.g., "users", "users.list", "users.list.read") */
  key: string;
  /** Display title for the tree node */
  title: string;
  /** Optional description explaining the permission or resource */
  description?: string;
  /** Permission ID (only present on leaf nodes) */
  permissionId?: number;
  /**
   * Indicates whether this is a leaf node (actual permission) or a parent node
   * (resource grouping)
   */
  isLeaf: boolean;
  /** Child nodes in the hierarchy */
  children?: PermissionTreeNode[];
}

/**
 * Retrieve permission hierarchy tree structure
 *
 * Returns all permissions organized as a hierarchical tree structure, suitable for
 * frontend permission selector components like Ant Design Tree. Permissions are
 * organized by resource code hierarchy, where each '.' (except the last one) represents
 * a resource level, and the final level combined with the action forms a leaf node.
 *
 * Hierarchical Structure Example:
 * - For permission code "users.list.read", this generates:
 *   * users (parent node)
 *     * list (parent node)
 *       * read (leaf node with permissionId)
 *
 * Use Cases:
 * - Permission selector in role permission management pages
 * - Tree display in permission configuration interfaces
 * - UI components requiring hierarchical permission display
 *
 * @returns Promise resolving to ApiResponse containing array of PermissionTreeNode
 * @throws {HttpError} 401 - Unauthorized (authentication required - missing or invalid JWT token)
 * @throws {HttpError} 500 - Internal server error
 *
 * @example
 * ```typescript
 * // Fetch permission hierarchy for role management UI
 * try {
 *   const response = await getPermissionsHierarchy();
 *   console.log('Permission tree:', response.data);
 *
 *   // Example response structure:
 *   // [
 *   //   {
 *   //     key: "users",
 *   //     title: "users",
 *   //     isLeaf: false,
 *   //     children: [
 *   //       {
 *   //         key: "users.list",
 *   //         title: "list",
 *   //         description: "使用者列表",
 *   //         isLeaf: false,
 *   //         children: [
 *   //           {
 *   //             key: "users.list.read",
 *   //             title: "檢視",
 *   //             description: "查看使用者列表",
 *   //             permissionId: 1,
 *   //             isLeaf: true
 *   //           }
 *   //         ]
 *   //       }
 *   //     ]
 *   //   }
 *   // ]
 * } catch (error) {
 *   if (error.code === 401) {
 *     console.error('Authentication required');
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 * @see {@link PermissionTreeNode} for the tree node structure
 * @remarks
 * Authorization: Requires valid JWT token. Recommended to restrict access to
 * administrators or users with permission management capabilities.
 */
export function getPermissionsHierarchy(): Promise<ApiResponse<PermissionTreeNode[]>> {
  return get<PermissionTreeNode[]>('/api/auth/permissions/hierarchy');
}

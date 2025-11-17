/**
 * @fileoverview Auth Management API - Handles authentication and user management endpoints
 * @module api/auth-management
 * @since 1.0.0
 */

import type { PagedData } from '@/types/PagedData';
import { get, post } from '@/utils/http/request';
import type { ApiResponse } from '@/utils/http/request';


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
 * @returns Promise resolving to ApiResponse containing an array of PermissionTreeNode
 * @throws {HttpError} 401 - Unauthorized (authentication required - missing or invalid JWT token)
 * @throws {HttpError} 500 - Internal server error
 *
 * @example
 * ```typeScript
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
 * Authorization: Requires a valid JWT token. Recommended to restrict access to
 * administrators or users with permission management capabilities.
 */
export function getPermissionsHierarchy(): Promise<ApiResponse<PermissionTreeNode[]>> {
  return get<PermissionTreeNode[]>('/api/auth/permissions/hierarchy');
}

/**
 * User data transfer object representing a user in the system
 * @interface UserResponse
 * @since 1.0.0
 */
export interface UserResponse {
  /** Employee ID (format: N + 9 digits, e.g., N123456789) */
  empId: string;
  /** User's full name */
  name: string;
  /** User active status (true for active, false for inactive) */
  isActive: boolean;
  /** Array of role IDs assigned to this user */
  roleIds: number[];
  /** Timestamp when the user was created (ISO 8601 format) */
  createdAt: string;
  /** Timestamp when the user was last updated (ISO 8601 format) */
  updatedAt: string;
}


/**
 * Query parameters for retrieving users with pagination and filtering
 * @interface UserQuery
 * @since 1.0.0
 */
export interface UserQuery {
  /** Page number (must be >= 1). Default is 1. */
  page?: number;
  /** Number of items per page (range: 1-100). Default is 10. */
  pageSize?: number;
  /** Optional fuzzy search filter by a username (case-insensitive) */
  name?: string;
  /** Optional fuzzy search filter by employee ID (case-insensitive) */
  empId?: string;
  /** Optional filter by user active status (true for active, false for inactive) */
  isActive?: boolean;
}

/**
 * Retrieve a paginated list of users with filtering support
 *
 * Retrieves users from the system with support for pagination and filtering by name,
 * employee ID, and active status. This endpoint requires authentication with appropriate
 * permissions ('users.list.read') to access user data.
 *
 * Query Parameters:
 * - page: Page number (default: 1, minimum: 1)
 * - pageSize: Items per page (default: 10, range: 1-100)
 * - name: Optional fuzzy search by username (case-insensitive, partial match)
 * - empId: Optional fuzzy search by employee ID (case-insensitive, partial match)
 * - isActive: Optional filter by user active status (true/false)
 *
 * Pagination Details:
 * - Pages are 1-indexed (first page is page 1)
 * - Maximum page size is 100 to prevent excessive data loading
 * - Response includes total count and total pages for client-side pagination UI
 *
 * @param params - Optional query parameters for pagination and filtering
 * @returns Promise resolving to ApiResponse containing paginated user data
 * @throws {HttpError} 400 - Request parameter validation failed (check page and pageSize values)
 * @throws {HttpError} 401 - Unauthorized (valid JWT token with appropriate permissions is required)
 * @throws {HttpError} 500 - Internal server error occurred while retrieving users
 *
 * @example
 * ```typescript
 * // Fetch first page with default page size (10)
 * try {
 *   const response = await getUsers({ page: 1 });
 *   console.log('Total users:', response.data.total);
 *   console.log('Users:', response.data.data);
 * } catch (error) {
 *   console.error('Failed to fetch users:', error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Search active users with name containing "John"
 * try {
 *   const response = await getUsers({
 *     page: 1,
 *     pageSize: 20,
 *     name: 'John',
 *     isActive: true
 *   });
 *   console.log(`Found ${response.data.total} users matching criteria`);
 *   response.data.data.forEach(user => {
 *     console.log(`${user.name} (${user.empId})`);
 *   });
 * } catch (error) {
 *   if (error.code === 401) {
 *     console.error('Authentication required');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Filter by employee ID and include inactive users
 * try {
 *   const response = await getUsers({
 *     empId: 'N123',
 *     isActive: false,
 *     pageSize: 50
 *   });
 *   console.log('Inactive users found:', response.data.data);
 * } catch (error) {
 *   console.error('Error:', error);
 * }
 * ```
 *
 * @since 1.0.0
 * @see {@link UserResponse} for the user data structure
 * @see {@link PagedData} for the paginated response structure
 * @see {@link UserQuery} for query parameter details
 * @remarks
 * Authorization: Requires a valid JWT token with 'users.list.read' permission.
 * Include the token in the Authorization header: Bearer {token}
 */
export function getUsers(params?: UserQuery): Promise<ApiResponse<PagedData<UserResponse>>> {
  return get<PagedData<UserResponse>>('/api/auth/users', params as Record<string, unknown>);
}

/**
 * Request payload for creating a new user
 * @interface CreateUserRequest
 * @since 1.0.0
 */
export interface CreateUserRequest {
  /** Employee ID (format: N + 9 digits, e.g., N123456789) */
  empId: string;
  /** User's full name (length: 1-128 characters) */
  name: string;
  /** User's password (length: 8-64 characters) */
  password: string;
  /** Optional array of role IDs to assign to the user */
  roleIds?: number[];
}

/**
 * Response data after successfully creating a user
 * @interface CreateUserResponse
 * @since 1.0.0
 */
export interface CreateUserResponse {
  /** Employee ID (format: N + 9 digits, e.g., N123456789) */
  empId: string;
  /** User's full name */
  name: string;
  /** User active status (true for active, false for inactive) */
  isActive: boolean;
  /** Array of role IDs assigned to this user */
  roleIds: number[];
  /** Timestamp when the user was created (ISO 8601 format) */
  createdAt: string;
  /** Timestamp when the user was last updated (ISO 8601 format) */
  updatedAt: string;
}

/**
 * Create a new user in the system
 *
 * Creates a new user account with optional role assignments. The employee ID must be unique
 * across the system. For security, the password is hashed using BCrypt before storage.
 *
 * Validation Rules:
 * - empId: Required, format N + 9 digits (e.g., N123456789)
 * - name: Required, length 1-128 characters
 * - password: Required, length 8-64 characters
 * - roleIds: Optional, array of role IDs (no duplicates)
 *
 * Request Body:
 * ```json
 * {
 *   "empId": "N123456789",
 *   "name": "張三",
 *   "password": "SecurePass123!",
 *   "roleIds": [1, 2]
 * }
 * ```
 *
 * @param data - The user creation data containing empId, name, password, and optional roleIds
 * @returns Promise resolving to ApiResponse containing CreateUserResponse data
 * @throws {HttpError} 400 - Validation failed (invalid format or missing required fields)
 * @throws {HttpError} 401 - Unauthorized (authentication required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions to create users)
 * @throws {HttpError} 409 - Conflict (employee ID already exists in the system)
 * @throws {HttpError} 500 - Internal server error occurred while creating user
 *
 * @example
 * ```typescript
 * // Create user with roles
 * try {
 *   const response = await createUser({
 *     empId: 'N123456789',
 *     name: '張三',
 *     password: 'SecurePass123!',
 *     roleIds: [1, 2]
 *   });
 *   console.log('User created:', response.data);
 *   console.log('User ID:', response.data.empId);
 *   console.log('Assigned roles:', response.data.roleIds);
 * } catch (error) {
 *   if (error.code === 409) {
 *     console.error('Employee ID already exists');
 *   } else if (error.code === 400) {
 *     console.error('Validation failed - check input format');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Create user without roles
 * try {
 *   const response = await createUser({
 *     empId: 'N987654321',
 *     name: '李四',
 *     password: 'MyPassword456!'
 *   });
 *   console.log('User created without roles:', response.data);
 * } catch (error) {
 *   console.error('Failed to create user:', error);
 * }
 * ```
 *
 * @since 1.0.0
 * @see {@link CreateUserRequest} for the request body structure
 * @see {@link CreateUserResponse} for the response data structure
 * @remarks
 * Authorization: Requires a valid JWT token with user creation permissions.
 * Include the token in the Authorization header: Bearer {token}
 */
export function createUser(data: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
  return post<CreateUserResponse, CreateUserRequest>('/api/auth/users', data);
}

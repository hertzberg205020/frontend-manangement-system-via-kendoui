/**
 * @fileoverview Auth Management API - Handles authentication and user management endpoints
 * @module api/auth-management
 * @since 1.0.0
 */

import type { PagedData } from '@/types/PagedData';
import { get, post, put } from '@/utils/http/request';
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
 * Request payload for updating an existing user
 * @interface UpdateUserRequest
 * @since 1.0.0
 */
export interface UpdateUserRequest {
  /** User's full name (length: 1-128 characters) */
  name: string;
  /** User active status (true for active, false for inactive) */
  isActive: boolean;
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

/**
 * Retrieve a single user by employee ID
 *
 * Fetches detailed information about a specific user using their employee ID.
 * This endpoint returns user information including their assigned role IDs and account status.
 *
 * Employee ID Format:
 * - Must match the pattern: ^N\d{9}$ (e.g., N123456789)
 * - The 'N' prefix is followed by exactly 9 digits
 *
 * Response includes:
 * - Employee ID (empId)
 * - User's full name
 * - Active status (isActive)
 * - List of assigned role IDs
 * - Account creation timestamp
 * - Last update timestamp
 *
 * @param empId - The employee ID to search for. Must match pattern ^N\d{9}$ (e.g., N123456789).
 * @returns Promise resolving to ApiResponse containing UserResponse data
 * @throws {HttpError} 401 - Unauthorized (valid JWT token is required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions to access this resource)
 * @throws {HttpError} 404 - User not found (the specified employee ID doesn't exist)
 *
 * @example
 * ```typescript
 * // Fetch a specific user by empId
 * try {
 *   const response = await getUserByEmpId('N123456789');
 *   console.log('User details:', response.data);
 *   console.log('User name:', response.data.name);
 *   console.log('Is active:', response.data.isActive);
 *   console.log('Roles:', response.data.roleIds);
 * } catch (error) {
 *   if (error.code === 404) {
 *     console.error('User not found');
 *   } else if (error.code === 403) {
 *     console.error('Access denied - insufficient permissions');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component with error handling
 * const fetchUserDetails = async (empId: string) => {
 *   try {
 *     const response = await getUserByEmpId(empId);
 *     setUser(response.data);
 *   } catch (error) {
 *     if (error.code === 404) {
 *       message.error('使用者不存在');
 *     } else {
 *       message.error('獲取使用者資訊失敗');
 *     }
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @see {@link UserResponse} for the response data structure
 * @remarks
 * Authorization: Requires a valid JWT token with 'users.list.read' permission.
 * Include the token in the Authorization header: Bearer {token}
 */
export function getUserByEmpId(empId: string): Promise<ApiResponse<UserResponse>> {
  return get<UserResponse>(`/api/auth/users/${empId}`);
}

/**
 * Update user information
 *
 * Updates the name and active status of a specified user. This endpoint does not support
 * updating password, employee ID, or roles.
 *
 * Fields that can be updated:
 * - name: User's name (1-128 characters)
 * - isActive: Account active status (boolean)
 *
 * Fields that cannot be updated:
 * - empId: Employee ID (used as identification key, cannot be changed)
 * - password: Password (requires dedicated password change endpoint)
 * - roleIds: Roles (requires dedicated role assignment endpoint)
 *
 * Path Parameters:
 * - empId: Required, format N + 9 digits (e.g., N123456789)
 *
 * Validation Rules:
 * - name: Required, length 1-128 characters
 * - isActive: Required, boolean value
 *
 * Request Body:
 * ```json
 * {
 *   "name": "李四",
 *   "isActive": false
 * }
 * ```
 *
 * @param empId - The employee ID of the user to update.
 *   Must match pattern ^N\d{9}$ (e.g., N123456789).
 * @param data - The user update data containing name and isActive
 * @returns Promise resolving to ApiResponse containing UpdateUserResponse data
 * @throws {HttpError} 400 - Validation failed (invalid format or missing required fields)
 * @throws {HttpError} 401 - Unauthorized (authentication required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions to update users)
 * @throws {HttpError} 404 - User not found (the specified employee ID doesn't exist)
 * @throws {HttpError} 500 - Internal server error occurred while updating user
 *
 * @example
 * ```typescript
 * // Update user name and status
 * try {
 *   const response = await updateUser('N123456789', {
 *     name: '李四',
 *     isActive: false
 *   });
 *   console.log('User updated:', response.data);
 *   console.log('Updated name:', response.data.name);
 *   console.log('Is active:', response.data.isActive);
 * } catch (error) {
 *   if (error.code === 404) {
 *     console.error('User not found');
 *   } else if (error.code === 400) {
 *     console.error('Validation failed - check input format');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Deactivate a user account
 * try {
 *   const response = await updateUser('N987654321', {
 *     name: '張三',
 *     isActive: false
 *   });
 *   console.log('User deactivated:', response.data);
 * } catch (error) {
 *   console.error('Failed to update user:', error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component with form handling
 * const handleSubmit = async (empId: string, values: UpdateUserRequest) => {
 *   try {
 *     const response = await updateUser(empId, values);
 *     message.success('使用者資訊更新成功');
 *     setUser(response.data);
 *   } catch (error) {
 *     if (error.code === 404) {
 *       message.error('使用者不存在');
 *     } else if (error.code === 403) {
 *       message.error('無權限更新使用者資訊');
 *     } else {
 *       message.error('更新失敗');
 *     }
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @see {@link UpdateUserRequest} for the request body structure
 * @see {@link UserResponse} for the response data structure
 * @remarks
 * Authorization: Requires a valid JWT token with user update permissions.
 * Include the token in the Authorization header: Bearer {token}
 */
export function updateUser(
  empId: string,
  data: UpdateUserRequest
): Promise<ApiResponse<UserResponse>> {
  return put<UserResponse, UpdateUserRequest>(`/api/auth/users/${empId}`, data);
}

/**
 * @fileoverview Auth Management API - Handles authentication and user management endpoints
 * @module api/auth-management
 * @since 1.0.0
 */

import type { PagedData } from '@/types/PagedData';
import { del, get, post, put } from '@/utils/http/request';
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

/**
 * Soft delete (deactivate) a user by employee ID
 *
 * Performs a soft delete operation by setting the user's isActive flag to false. This preserves
 * the user's historical data and role assignments for auditability while preventing future logins.
 *
 * Behavior Details:
 * - Only administrators or users with delete permissions can perform this action
 * - The user remains in the database, allowing potential reactivation via {@link updateUser}
 * - Roles remain associated but effectively inactive due to the user's disabled state
 *
 * @param empId - Employee ID of the user to deactivate (format: ^N\d{9}$)
 * @returns Promise resolving to ApiResponse with null data on success
 * @throws {HttpError} 400 - Invalid empId format or validation failure
 * @throws {HttpError} 401 - Unauthorized (missing or invalid JWT)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions)
 * @throws {HttpError} 404 - User not found
 * @throws {HttpError} 500 - Internal server error during deletion
 *
 * @example
 * ```typescript
 * try {
 *   await deleteUser('N123456789');
 *   message.success('使用者已停用');
 * } catch (error) {
 *   message.error(error.message);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function deleteUser(empId: string): Promise<ApiResponse<string>> {
  return del<string>(`/api/auth/users/${empId}`);
}

/**
 * Request payload for replacing user roles
 * @interface ReplaceUserRolesRequest
 * @since 1.0.0
 */
export interface ReplaceUserRolesRequest {
  /** Array of role IDs to assign to the user (replaces all existing roles) */
  roleIds: number[];
}

/**
 * Response data after successfully replacing user roles
 * @interface UserRolesDto
 * @since 1.0.0
 */
export interface UserRolesDto {
  /** Employee ID (format: N + 9 digits, e.g., N123456789) */
  empId: string;
  /** Array of role IDs currently assigned to the user */
  roleIds: number[];
}

/**
 * Replace all roles assigned to a user (full replacement)
 *
 * This endpoint completely replaces the user's role collection with the provided role IDs.
 * It removes all existing roles and assigns the new set in a single atomic operation.
 *
 * Behavior Details:
 * - Removes all existing roles from the user
 * - Assigns the new set of roles provided in the request
 * - If roleIds is an empty array, removes all roles from the user
 * - Duplicate roleIds are automatically deduplicated
 * - Operation is executed within a single transaction to ensure data consistency
 *
 * Validation Rules:
 * - empId: Required, format N + 9 digits (e.g., N123456789)
 * - roleIds: Required, can be an empty array
 * - Each roleId must correspond to an existing role in the database
 *
 * Use Cases:
 * - Changing user access levels by replacing their entire role set
 * - Bulk role updates in user management interfaces
 * - Resetting user permissions by clearing all roles (empty array)
 *
 * Request Body:
 * ```json
 * {
 *   "roleIds": [1, 2, 3]
 * }
 * ```
 *
 * @param empId - Employee ID of the user whose roles will be replaced.
 *   Must match pattern ^N\d{9}$ (e.g., N123456789).
 * @param data - The role replacement request containing an array of role IDs
 * @returns Promise resolving to ApiResponse containing UserRolesDto data
 * @throws {HttpError} 400 - Validation failed or invalid role ID provided
 * @throws {HttpError} 401 - Unauthorized (authentication required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions - requires admin role)
 * @throws {HttpError} 404 - User not found (the specified employee ID doesn't exist)
 * @throws {HttpError} 500 - Internal server error occurred while replacing roles
 *
 * @example
 * ```typescript
 * // Replace user roles with new set
 * try {
 *   const response = await replaceUserRoles('N123456789', {
 *     roleIds: [1, 2, 3]
 *   });
 *   console.log('Roles updated:', response.data);
 *   console.log('Employee ID:', response.data.empId);
 *   console.log('New roles:', response.data.roleIds);
 * } catch (error) {
 *   if (error.code === 404) {
 *     console.error('User not found');
 *   } else if (error.code === 400) {
 *     console.error('Invalid role ID provided');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Remove all roles from a user
 * try {
 *   const response = await replaceUserRoles('N987654321', {
 *     roleIds: []
 *   });
 *   console.log('All roles removed for user:', response.data.empId);
 * } catch (error) {
 *   console.error('Failed to remove roles:', error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component with Ant Design
 * const handleRoleUpdate = async (empId: string, selectedRoles: number[]) => {
 *   try {
 *     const response = await replaceUserRoles(empId, {
 *       roleIds: selectedRoles
 *     });
 *     message.success('使用者角色更新成功');
 *     setUserRoles(response.data.roleIds);
 *   } catch (error) {
 *     if (error.code === 404) {
 *       message.error('使用者不存在');
 *     } else if (error.code === 403) {
 *       message.error('無權限更新使用者角色');
 *     } else if (error.code === 400) {
 *       message.error('無效的角色 ID');
 *     } else {
 *       message.error('更新失敗');
 *     }
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @see {@link ReplaceUserRolesRequest} for the request body structure
 * @see {@link UserRolesDto} for the response data structure
 * @remarks
 * Authorization: Requires a valid JWT token with admin role permissions.
 * This operation is restricted to administrators due to its sensitive nature.
 * Include the token in the Authorization header: Bearer {token}
 */
export function replaceUserRoles(
  empId: string,
  data: ReplaceUserRolesRequest
): Promise<ApiResponse<UserRolesDto>> {
  return put<UserRolesDto, ReplaceUserRolesRequest>(`/api/auth/users/${empId}/roles`, data);
}

/**
 * Role data transfer object representing a role in the system
 * @interface RoleDto
 * @since 1.0.0
 */
export interface RoleDto {
  /** Role ID (unique identifier) */
  id: number;
  /** Role name (unique, max 100 characters) */
  name: string;
  /** Optional description of the role (max 512 characters) */
  description?: string;
  /** Timestamp when the role was created (ISO 8601 format) */
  createdAt: string;
  /** Timestamp when the role was last updated (ISO 8601 format) */
  updatedAt: string;
  /** Array of permission IDs assigned to this role */
  permissionIds: number[];
}

/**
 * Retrieve all available roles with their assigned permissions
 *
 * Fetches a complete list of all roles in the system, including their associated permissions.
 * This endpoint is designed for permission management pages and provides a comprehensive view
 * of all roles and their permissions in a single request, avoiding N+1 query issues and
 * improving performance.
 *
 * Key Features:
 * - Returns all roles with their permission IDs in one request
 * - Reduces the number of API calls needed for permission management UIs
 * - Roles are sorted by creation time (newest first)
 * - If no roles exist, returns an empty array
 * - Each role object includes its complete permission ID list
 *
 * Response Structure:
 * - Success: Array of RoleDto objects, each containing:
 *   * id: Role's unique identifier
 *   * name: Role name (e.g., "admin", "user")
 *   * description: Optional role description
 *   * permissionIds: Array of permission IDs assigned to the role
 *   * createdAt: ISO 8601 timestamp of creation
 *   * updatedAt: ISO 8601 timestamp of last update
 *
 * Use Cases:
 * - Permission management interfaces
 * - Role configuration pages
 * - User role assignment forms
 * - Role-based access control (RBAC) setup
 *
 * @returns Promise resolving to ApiResponse containing an array of RoleDto objects
 * @throws {HttpError} 401 - Unauthorized (valid JWT token is required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions to access roles)
 * @throws {HttpError} 500 - Internal server error occurred while retrieving roles
 *
 * @example
 * ```typescript
 * // Fetch all roles for a permission management page
 * try {
 *   const response = await getRoles();
 *   console.log('Total roles:', response.data.length);
 *   response.data.forEach(role => {
 *     console.log(`${role.name}: ${role.permissionIds.length} permissions`);
 *   });
 *
 *   // Example response:
 *   // [
 *   //   {
 *   //     id: 1,
 *   //     name: "admin",
 *   //     description: "系統管理員",
 *   //     permissionIds: [1, 2, 3, 5, 8, 10],
 *   //     createdAt: "2024-01-15T10:30:00Z",
 *   //     updatedAt: "2024-01-15T10:30:00Z"
 *   //   },
 *   //   {
 *   //     id: 2,
 *   //     name: "user",
 *   //     description: "一般使用者",
 *   //     permissionIds: [1, 2],
 *   //     createdAt: "2024-01-16T11:45:00Z",
 *   //     updatedAt: "2024-01-16T11:45:00Z"
 *   //   }
 *   // ]
 * } catch (error) {
 *   console.error('Failed to fetch roles:', error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component with Ant Design Select
 * const [roles, setRoles] = useState<RoleDto[]>([]);
 *
 * useEffect(() => {
 *   const fetchRoles = async () => {
 *     try {
 *       const response = await getRoles();
 *       setRoles(response.data);
 *     } catch (error) {
 *       if (error.code === 401) {
 *         message.error('請先登入');
 *       } else if (error.code === 403) {
 *         message.error('無權限查看角色列表');
 *       } else {
 *         message.error('獲取角色列表失敗');
 *       }
 *     }
 *   };
 *   fetchRoles();
 * }, []);
 *
 * // Render role selector
 * return (
 *   <Select placeholder="選擇角色">
 *     {roles.map(role => (
 *       <Select.Option key={role.id} value={role.id}>
 *         {role.name} - {role.description}
 *       </Select.Option>
 *     ))}
 *   </Select>
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Display roles in a permission management table
 * try {
 *   const response = await getRoles();
 *   const tableData = response.data.map(role => ({
 *     key: role.id,
 *     name: role.name,
 *     description: role.description,
 *     permissionCount: role.permissionIds.length,
 *     createdAt: new Date(role.createdAt).toLocaleDateString(),
 *   }));
 *   setDataSource(tableData);
 * } catch (error) {
 *   message.error('載入角色資料失敗');
 * }
 * ```
 *
 * @since 1.0.0
 * @see {@link RoleDto} for the role data structure
 * @remarks
 * Authorization: Requires a valid JWT token. Include the token in the
 * Authorization header: Bearer {token}
 */
export function getRoles(): Promise<ApiResponse<RoleDto[]>> {
  return get<RoleDto[]>('/api/auth/roles');
}

/**
 * Request payload for creating a new role
 * @interface CreateRoleRequest
 * @since 1.0.0
 */
export interface CreateRoleRequest {
  /** Role name (required, unique, max 100 characters) */
  name: string;
  /** Optional description of the role (max 512 characters) */
  description?: string;
}

/**
 * Create a new role in the system
 *
 * Creates a new role with a unique name. Role names are case-insensitive and must be unique
 * across the system. The newly created role initially has no permissions assigned and must
 * be configured separately through the role permissions endpoint.
 *
 * Validation Rules:
 * - name: Required, length 1-100 characters, must be unique (case-insensitive)
 * - description: Optional, maximum length 512 characters
 *
 * Use Cases:
 * - Creating new user role types for RBAC (Role-Based Access Control)
 * - Setting up organizational roles (e.g., "Project Manager", "Team Lead")
 * - Defining custom access levels for different user groups
 *
 * Request Body:
 * ```json
 * {
 *   "name": "Project Manager",
 *   "description": "Manages project planning and execution"
 * }
 * ```
 *
 * @param data - The role creation data containing name and optional description
 * @returns Promise resolving to ApiResponse containing RoleDto data
 * @throws {HttpError} 400 - Validation failed (invalid format or missing required fields)
 * @throws {HttpError} 401 - Unauthorized (authentication required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions - requires admin role)
 * @throws {HttpError} 409 - Conflict (role name already exists in the system)
 * @throws {HttpError} 500 - Internal server error occurred while creating role
 *
 * @example
 * ```typescript
 * // Create a new role with description
 * try {
 *   const response = await createRole({
 *     name: 'Project Manager',
 *     description: 'Manages project planning and execution'
 *   });
 *   console.log('Role created:', response.data);
 *   console.log('Role ID:', response.data.id);
 *   console.log('Role name:', response.data.name);
 *   console.log('Initial permissions:', response.data.permissionIds); // Should be []
 * } catch (error) {
 *   if (error.code === 409) {
 *     console.error('Role name already exists');
 *   } else if (error.code === 400) {
 *     console.error('Validation failed - check input format');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Create a role without description
 * try {
 *   const response = await createRole({
 *     name: 'Guest User'
 *   });
 *   console.log('Guest role created:', response.data);
 * } catch (error) {
 *   console.error('Failed to create role:', error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component with form handling
 * const handleCreateRole = async (values: CreateRoleRequest) => {
 *   try {
 *     const response = await createRole(values);
 *     message.success('角色建立成功');
 *     // Navigate to role list or update local state
 *     navigate('/roles');
 *   } catch (error) {
 *     if (error.code === 409) {
 *       message.error('角色名稱已存在');
 *     } else if (error.code === 403) {
 *       message.error('無權限建立角色');
 *     } else if (error.code === 400) {
 *       message.error('輸入驗證失敗');
 *     } else {
 *       message.error('建立失敗');
 *     }
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @see {@link CreateRoleRequest} for the request body structure
 * @see {@link RoleDto} for the response data structure
 * @remarks
 * Authorization: Requires a valid JWT token with admin role permissions.
 * This operation is restricted to administrators due to its sensitive nature.
 * Include the token in the Authorization header: Bearer {token}
 *
 * Note: The newly created role will have an empty permissionIds array. Use the
 * PUT /api/auth/roles/{id}/permissions endpoint to assign permissions to the role.
 */
export function createRole(data: CreateRoleRequest): Promise<ApiResponse<RoleDto>> {
  return post<RoleDto, CreateRoleRequest>('/api/auth/roles', data);
}

/**
 * Retrieve a single role by role ID
 *
 * Fetches detailed information about a specific role using its role ID.
 * This endpoint returns complete role information including the role's assigned permission IDs,
 * which is useful for role editing interfaces and permission management pages.
 *
 * Path Parameters:
 * - id: Required, role ID (positive integer, minimum: 1)
 *
 * Response includes:
 * - Role ID (id)
 * - Role name (unique identifier)
 * - Role description (optional)
 * - List of assigned permission IDs
 * - Account creation timestamp
 * - Last update timestamp
 *
 * Use Cases:
 * - Viewing detailed role information
 * - Fetching existing data before editing a role
 * - Displaying role information in permission management pages
 * - Pre-populating role edit forms
 *
 * @param id - The role ID to search for. Must be a positive integer (>= 1).
 * @returns Promise resolving to ApiResponse containing RoleDto data
 * @throws {HttpError} 401 - Unauthorized (valid JWT token is required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions to access this resource)
 * @throws {HttpError} 404 - Role not found (the specified role ID doesn't exist)
 * @throws {HttpError} 500 - Internal server error occurred while retrieving role
 *
 * @example
 * ```typescript
 * // Fetch a specific role by ID
 * try {
 *   const response = await getRoleById(1);
 *   console.log('Role details:', response.data);
 *   console.log('Role name:', response.data.name);
 *   console.log('Description:', response.data.description);
 *   console.log('Permissions:', response.data.permissionIds);
 *   console.log('Created at:', response.data.createdAt);
 *
 *   // Example response structure:
 *   // {
 *   //   id: 1,
 *   //   name: "admin",
 *   //   description: "系統管理員",
 *   //   permissionIds: [1, 2, 3, 5, 8, 10],
 *   //   createdAt: "2024-01-15T10:30:00Z",
 *   //   updatedAt: "2024-01-15T10:30:00Z"
 *   // }
 * } catch (error) {
 *   if (error.code === 404) {
 *     console.error('Role not found');
 *   } else if (error.code === 403) {
 *     console.error('Access denied - insufficient permissions');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component for role editing
 * const fetchRoleForEdit = async (roleId: number) => {
 *   try {
 *     const response = await getRoleById(roleId);
 *     // Pre-populate form with existing role data
 *     form.setFieldsValue({
 *       name: response.data.name,
 *       description: response.data.description,
 *       permissionIds: response.data.permissionIds,
 *     });
 *   } catch (error) {
 *     if (error.code === 404) {
 *       message.error('角色不存在');
 *       navigate('/roles');
 *     } else {
 *       message.error('獲取角色資訊失敗');
 *     }
 *   }
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Display role details in a modal
 * const showRoleDetails = async (roleId: number) => {
 *   try {
 *     const response = await getRoleById(roleId);
 *     Modal.info({
 *       title: response.data.name,
 *       content: (
 *         <div>
 *           <p>描述: {response.data.description}</p>
 *           <p>權限數量: {response.data.permissionIds.length}</p>
 *           <p>建立時間: {new Date(response.data.createdAt).toLocaleDateString()}</p>
 *         </div>
 *       ),
 *     });
 *   } catch (error) {
 *     message.error('無法載入角色詳情');
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @see {@link RoleDto} for the response data structure
 * @remarks
 * Authorization: Requires a valid JWT token.
 * Include the token in the Authorization header: Bearer {token}
 */
export function getRoleById(id: number): Promise<ApiResponse<RoleDto>> {
  return get<RoleDto>(`/api/auth/roles/${id}`);
}

/**
 * Request payload for updating an existing role
 * @interface UpdateRoleRequest
 * @since 1.0.0
 */
export interface UpdateRoleRequest {
  /** Role name (required, unique, max 100 characters) */
  name: string;
  /** Optional description of the role (max 512 characters) */
  description?: string;
}

/**
 * Request payload for replacing role permissions
 * @interface ReplaceRolePermissionsRequest
 * @since 1.0.0
 */
export interface ReplaceRolePermissionsRequest {
  /** Array of permission IDs to assign to the role (replaces all existing permissions) */
  permissionIds: number[];
}

/**
 * Update role information
 *
 * Updates the name and description of a specified role. This endpoint does not support
 * updating role permissions - permission management should use the dedicated endpoint
 * PUT /api/auth/roles/{id}/permissions.
 *
 * Fields that can be updated:
 * - name: Role name (1-100 characters, must be unique)
 * - description: Role description (optional, max 512 characters)
 *
 * Fields that cannot be updated:
 * - id: Role ID (used as identification key, cannot be changed)
 * - permissionIds: Role permissions (requires dedicated permission management endpoint)
 *
 * Path Parameters:
 * - id: Required, role ID (positive integer, minimum: 1)
 *
 * Validation Rules:
 * - name: Required, length 1-100 characters, system-wide unique (case-insensitive)
 * - description: Optional, maximum length 512 characters
 *
 * Use Cases:
 * - Renaming roles to better reflect their purpose
 * - Updating role descriptions to clarify their responsibilities
 * - Maintaining role information in permission management interfaces
 *
 * Request Body:
 * ```json
 * {
 *   "name": "Super Admin",
 *   "description": "系統超級管理員，擁有所有權限"
 * }
 * ```
 *
 * @param id - Role ID to update. Must be a positive integer (>= 1).
 * @param data - The role update data containing name and optional description
 * @returns Promise resolving to ApiResponse containing updated RoleDto data
 * @throws {HttpError} 400 - Validation failed (invalid format or missing required fields)
 * @throws {HttpError} 401 - Unauthorized (authentication required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions - requires admin role)
 * @throws {HttpError} 404 - Role not found (the specified role ID doesn't exist)
 * @throws {HttpError} 409 - Conflict (role name already exists in the system)
 * @throws {HttpError} 500 - Internal server error occurred while updating role
 *
 * @example
 * ```typescript
 * // Update role name and description
 * try {
 *   const response = await updateRole(1, {
 *     name: 'Super Admin',
 *     description: '系統超級管理員，擁有所有權限'
 *   });
 *   console.log('Role updated:', response.data);
 *   console.log('Updated name:', response.data.name);
 *   console.log('Updated description:', response.data.description);
 *   console.log('Permissions unchanged:', response.data.permissionIds);
 * } catch (error) {
 *   if (error.code === 404) {
 *     console.error('Role not found');
 *   } else if (error.code === 409) {
 *     console.error('Role name already exists');
 *   } else if (error.code === 400) {
 *     console.error('Validation failed - check input format');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Update only role description, keep name unchanged
 * try {
 *   // First fetch current role data
 *   const currentRole = await getRoleById(2);
 *   // Update with new description
 *   const response = await updateRole(2, {
 *     name: currentRole.data.name,
 *     description: '更新後的角色描述'
 *   });
 *   console.log('Description updated:', response.data);
 * } catch (error) {
 *   console.error('Failed to update role:', error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component with form handling
 * const handleUpdateRole = async (roleId: number, values: UpdateRoleRequest) => {
 *   try {
 *     const response = await updateRole(roleId, values);
 *     message.success('角色資訊更新成功');
 *     // Navigate back to role list or update local state
 *     navigate('/roles');
 *   } catch (error) {
 *     if (error.code === 404) {
 *       message.error('角色不存在');
 *     } else if (error.code === 409) {
 *       message.error('角色名稱已存在');
 *     } else if (error.code === 403) {
 *       message.error('無權限更新角色資訊');
 *     } else if (error.code === 400) {
 *       message.error('輸入驗證失敗');
 *     } else {
 *       message.error('更新失敗');
 *     }
 *   }
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Use with Ant Design Form
 * const [form] = Form.useForm();
 *
 * const onFinish = async (values: UpdateRoleRequest) => {
 *   try {
 *     const response = await updateRole(roleId, values);
 *     message.success(`角色 "${response.data.name}" 更新成功`);
 *     form.resetFields();
 *   } catch (error) {
 *     if (error.code === 409) {
 *       form.setFields([
 *         {
 *           name: 'name',
 *           errors: ['此角色名稱已被使用'],
 *         },
 *       ]);
 *     } else {
 *       message.error('更新失敗');
 *     }
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @see {@link UpdateRoleRequest} for the request body structure
 * @see {@link RoleDto} for the response data structure
 * @see {@link getRoleById} for fetching current role data
 * @see {@link replaceRolePermissions} for updating role permissions
 * @remarks
 * Authorization: Requires a valid JWT token with admin role permissions.
 * This operation is restricted to administrators due to its sensitive nature.
 * Include the token in the Authorization header: Bearer {token}
 *
 * Note: This endpoint only updates the role's name and description. To update the role's
 * permissions, use the PUT /api/auth/roles/{id}/permissions endpoint instead. The
 * permissionIds in the response reflect the role's current permissions, which remain
 * unchanged by this operation.
 */
export function updateRole(id: number, data: UpdateRoleRequest): Promise<ApiResponse<RoleDto>> {
  return put<RoleDto, UpdateRoleRequest>(`/api/auth/roles/${id}`, data);
}

/**
 * Response data after successfully replacing role permissions
 * @interface RolePermissionsDto
 * @since 1.0.0
 */
export interface RolePermissionsDto {
  /** Role ID */
  roleId: number;
  /** Array of permission IDs currently assigned to the role */
  permissionIds: number[];
}

/**
 * Replace all permissions assigned to a role (full replacement)
 *
 * This endpoint completely replaces the role's permission collection with the provided
 * permission IDs. It removes all existing permissions and assigns the new set in a single
 * atomic operation.
 *
 * Behavior Details:
 * - Removes all existing permissions from the role
 * - Assigns the new set of permissions provided in the request
 * - If permissionIds is an empty array, removes all permissions from the role
 * - Duplicate permissionIds are automatically deduplicated
 * - Operation is executed within a single transaction to ensure data consistency
 * - All permission IDs must correspond to valid, active, and non-deprecated permissions
 *
 * Validation Rules:
 * - id: Required, must be a valid role ID (positive integer > 0)
 * - permissionIds: Required, can be an empty array to clear all permissions
 * - Each permissionId must correspond to an existing, active, and non-deprecated permission
 *
 * Use Cases:
 * - Changing role access levels by replacing the entire permission set
 * - Bulk permission updates in role management interfaces
 * - Resetting role permissions by clearing all permissions (empty array)
 * - Configuring permissions for newly created roles
 *
 * Request Body:
 * ```json
 * {
 *   "permissionIds": [1, 2, 3, 5, 8]
 * }
 * ```
 *
 * @param id - Role ID whose permissions will be replaced. Must be a positive integer (>= 1).
 * @param data - The permission replacement request containing an array of permission IDs
 * @returns Promise resolving to ApiResponse containing RolePermissionsDto data
 * @throws {HttpError} 400 - Validation failed or invalid permission ID provided
 * @throws {HttpError} 401 - Unauthorized (authentication required)
 * @throws {HttpError} 403 - Forbidden (insufficient permissions to update role permissions)
 * @throws {HttpError} 404 - Role not found (the specified role ID doesn't exist)
 * @throws {HttpError} 500 - Internal server error occurred while replacing permissions
 *
 * @example
 * ```typescript
 * // Replace role permissions with new set
 * try {
 *   const response = await replaceRolePermissions(1, {
 *     permissionIds: [1, 2, 3, 5, 8]
 *   });
 *   console.log('Permissions updated:', response.data);
 *   console.log('Role ID:', response.data.roleId);
 *   console.log('New permissions:', response.data.permissionIds);
 * } catch (error) {
 *   if (error.code === 404) {
 *     console.error('Role not found');
 *   } else if (error.code === 400) {
 *     console.error('Invalid permission ID provided');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Remove all permissions from a role
 * try {
 *   const response = await replaceRolePermissions(2, {
 *     permissionIds: []
 *   });
 *   console.log('All permissions removed for role:', response.data.roleId);
 * } catch (error) {
 *   console.error('Failed to remove permissions:', error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component with Ant Design Tree
 * const handlePermissionUpdate = async (roleId: number, selectedPermissions: number[]) => {
 *   try {
 *     const response = await replaceRolePermissions(roleId, {
 *       permissionIds: selectedPermissions
 *     });
 *     message.success('角色權限更新成功');
 *     setRolePermissions(response.data.permissionIds);
 *   } catch (error) {
 *     if (error.code === 404) {
 *       message.error('角色不存在');
 *     } else if (error.code === 403) {
 *       message.error('無權限更新角色權限');
 *     } else if (error.code === 400) {
 *       message.error('無效的權限 ID');
 *     } else {
 *       message.error('更新失敗');
 *     }
 *   }
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Configure permissions for a newly created role
 * const setupNewRole = async () => {
 *   try {
 *     // First, create the role
 *     const createResponse = await createRole({
 *       name: 'Content Editor',
 *       description: 'Can create and edit content'
 *     });
 *
 *     // Then assign permissions to it
 *     const permissionsResponse = await replaceRolePermissions(createResponse.data.id, {
 *       permissionIds: [10, 11, 12] // Content-related permissions
 *     });
 *
 *     message.success(`角色 "${createResponse.data.name}" 建立並配置成功`);
 *     console.log('Role with permissions:', permissionsResponse.data);
 *   } catch (error) {
 *     message.error('角色設定失敗');
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @see {@link ReplaceRolePermissionsRequest} for the request body structure
 * @see {@link RolePermissionsDto} for the response data structure
 * @see {@link createRole} for creating new roles
 * @see {@link getPermissionsHierarchy} for retrieving available permissions
 * @remarks
 * Authorization: Requires a valid JWT token with role permission management capabilities.
 * This operation is typically restricted to administrators due to its sensitive nature.
 * Include the token in the Authorization header: Bearer {token}
 *
 * Note: This is a full replacement operation, not an incremental update. All existing
 * permissions will be removed and replaced with the new set. If you need to add or remove
 * specific permissions while keeping others, fetch the current permissions first using
 * {@link getRoleById}, modify the array, and then call this endpoint with the updated array.
 */
export function replaceRolePermissions(
  id: number,
  data: ReplaceRolePermissionsRequest
): Promise<ApiResponse<RolePermissionsDto>> {
  return put<RolePermissionsDto, ReplaceRolePermissionsRequest>(
    `/api/auth/roles/${id}/permissions`,
    data
  );
}

/**
 * Permission data transfer object representing a permission in the system
 * @interface PermissionDto
 * @since 1.0.0
 */
export interface PermissionDto {
  /** Unique permission identifier */
  id: number;
  /** Associated resource identifier */
  resourceId: number;
  /** Action type (read, create, edit, delete) */
  action: string;
  /** Permission code in format {resource_code}.{action} (e.g., users.list.read) */
  code: string;
  /** Human-readable description of the permission */
  description?: string;
}

/**
 * Retrieve all active and valid permissions in the system
 *
 * Returns a complete list of all active permissions that are not deprecated. Each permission
 * includes its ID, resource ID, action type, permission code, and description. This endpoint
 * is useful for permission management pages, role assignment interfaces, and displaying
 * available permissions to administrators.
 *
 * Response Structure:
 * - Success: Array of PermissionDto objects sorted by resource code and action type
 * - Each permission includes:
 *   * id: Permission's unique identifier
 *   * resourceId: ID of the resource this permission applies to
 *   * action: Action type (read, create, edit, delete)
 *   * code: Permission code in format {resource_code}.{action}
 *   * description: Human-readable description of what the permission allows
 *
 * Permission Code Format:
 * - Composed of resource code and action, separated by dots
 * - Examples: users.list.read, roles.create.create, equipment.read
 * - Format: {resource_code}.{action} or {resource_code}.{sub_resource}.{action}
 *
 * Use Cases:
 * - Permission management interfaces
 * - Role permission assignment forms
 * - Displaying available permissions for selection
 * - Building permission-based access control UIs
 * - Audit logs showing what permissions exist in the system
 *
 * @returns Promise resolving to ApiResponse containing an array of PermissionDto objects
 * @throws {HttpError} 401 - Unauthorized (valid JWT token is required)
 * @throws {HttpError} 403 - Forbidden (token is valid but lacks sufficient permissions)
 * @throws {HttpError} 500 - Internal server error occurred while retrieving permissions
 *
 * @example
 * ```typescript
 * // Fetch all permissions for a permission management page
 * try {
 *   const response = await getPermissions();
 *   console.log('Total permissions:', response.data.length);
 *   response.data.forEach(permission => {
 *     console.log(`${permission.code}: ${permission.description}`);
 *   });
 *
 *   // Example response structure:
 *   // [
 *   //   {
 *   //     id: 1,
 *   //     resourceId: 1,
 *   //     action: "read",
 *   //     code: "users.list.read",
 *   //     description: "讀取使用者列表"
 *   //   },
 *   //   {
 *   //     id: 2,
 *   //     resourceId: 1,
 *   //     action: "create",
 *   //     code: "users.create.create",
 *   //     description: "建立新使用者"
 *   //   }
 *   // ]
 * } catch (error) {
 *   if (error.code === 401) {
 *     console.error('Authentication required');
 *   } else if (error.code === 403) {
 *     console.error('Insufficient permissions');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React component with Ant Design Checkbox Group
 * const [permissions, setPermissions] = useState<PermissionDto[]>([]);
 *
 * useEffect(() => {
 *   const fetchPermissions = async () => {
 *     try {
 *       const response = await getPermissions();
 *       setPermissions(response.data);
 *     } catch (error) {
 *       if (error.code === 401) {
 *         message.error('請先登入');
 *       } else if (error.code === 403) {
 *         message.error('無權限查看權限列表');
 *       } else {
 *         message.error('獲取權限列表失敗');
 *       }
 *     }
 *   };
 *   fetchPermissions();
 * }, []);
 *
 * // Render permission list
 * return (
 *   <Checkbox.Group>
 *     {permissions.map(permission => (
 *       <Checkbox key={permission.id} value={permission.id}>
 *         {permission.code} - {permission.description}
 *       </Checkbox>
 *     ))}
 *   </Checkbox.Group>
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Group permissions by resource for better UI organization
 * try {
 *   const response = await getPermissions();
 *   const groupedPermissions = response.data.reduce((acc, permission) => {
 *     const resourceCode = permission.code.split('.')[0];
 *     if (!acc[resourceCode]) {
 *       acc[resourceCode] = [];
 *     }
 *     acc[resourceCode].push(permission);
 *     return acc;
 *   }, {} as Record<string, PermissionDto[]>);
 *
 *   console.log('Permissions grouped by resource:', groupedPermissions);
 * } catch (error) {
 *   message.error('載入權限資料失敗');
 * }
 * ```
 *
 * @since 1.0.0
 * @see {@link PermissionDto} for the permission data structure
 * @remarks
 * Authorization: Requires a valid JWT token. This endpoint only requires authentication
 * and does not need specific permissions - all logged-in users can query the permission list.
 * Include the token in the Authorization header: Bearer {token}
 */
export function getPermissions(): Promise<ApiResponse<PermissionDto[]>> {
  return get<PermissionDto[]>('/api/auth/permissions');
}

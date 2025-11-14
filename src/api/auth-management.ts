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

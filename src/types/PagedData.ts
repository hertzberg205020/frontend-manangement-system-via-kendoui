/**
 * Paginated data structure for user list responses
 * @interface PagedData
 * @template T - Type of data items in the paginated response
 * @since 1.0.0
 */
export interface PagedData<T> {
  /** Array of data items for the current page */
  data: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages available */
  totalPages: number;
}

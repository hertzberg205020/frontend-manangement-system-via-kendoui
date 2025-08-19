/**
 * @fileoverview HTTP client utility with comprehensive error handling,
 *  retry logic, and request/response interceptors
 * @author Graham
 * @since 1.0.0
 */

import axios from 'axios';
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios';
import { message } from 'antd';
import { store } from '@/store';

/**
 * Base URL for all HTTP requests, loaded from environment variables
 * @since 1.0.0
 */
const BASE_URL: string = import.meta.env.VITE_API_URL;

/**
 * HTTP error types enumeration using const assertion for better TypeScript compatibility
 * @since 1.0.0
 * @example
 * ```typescript
 * if (error.type === ErrorType.NETWORK_ERROR) {
 *   // Handle network error
 * }
 * ```
 */
export const ErrorType = {
  /** Network connectivity issues */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** Request timeout errors */
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  /** Server-side errors (5xx status codes) */
  SERVER_ERROR: 'SERVER_ERROR',
  /** Client-side errors (4xx status codes) */
  CLIENT_ERROR: 'CLIENT_ERROR',
  /** Business logic errors from API responses */
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  /** Authentication required (401 status) */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** Access forbidden (403 status) */
  FORBIDDEN: 'FORBIDDEN'
} as const;

/**
 * Type definition for error types derived from ErrorType constant
 * @since 1.0.0
 */
export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * Comprehensive HTTP error information interface
 * @since 1.0.0
 * @example
 * ```typescript
 * const error: HttpError = {
 *   type: ErrorType.NETWORK_ERROR,
 *   code: 'NETWORK_ERROR',
 *   message: 'Connection failed',
 *   timestamp: new Date().toISOString(),
 *   url: '/api/users',
 *   method: 'GET'
 * };
 * ```
 */
export interface HttpError {
  /** Type of error from ErrorType enumeration */
  type: ErrorType;
  /** HTTP status code or custom error code */
  code: number | string;
  /** Human-readable error message */
  message: string;
  /** Original error object for debugging */
  originalError?: Error | AxiosError | unknown;
  /** ISO timestamp when error occurred */
  timestamp: string;
  /** Request URL that caused the error */
  url?: string;
  /** HTTP method used in the failed request */
  method?: string;
}

/**
 * Request metadata interface for tracking and debugging
 * @since 1.0.0
 */
interface RequestMetadata {
  /** Unique identifier for the request */
  requestId: string;
  /** Timestamp when request started (milliseconds) */
  startTime: number;
}

/**
 * Axios module augmentation to add metadata support
 * @since 1.0.0
 */
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** Optional metadata for request tracking */
    metadata?: RequestMetadata;
  }
}

/**
 * Configuration interface for retry logic
 * @since 1.0.0
 */
interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  retryDelay: number;
  /** Function to determine if error should be retried */
  retryCondition: (error: AxiosError) => boolean;
}

/**
 * Default retry configuration for failed HTTP requests
 * @since 1.0.0
 * @see {@link RetryConfig} for configuration options
 */
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Only retry network errors and 5xx server errors
    // Client errors (4xx) should not be retried as they indicate request issues
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

/**
 * Checks if an HTTP status code indicates a successful request
 * @param statusCode - The HTTP status code to check
 * @returns True if status code is in the 2xx range (200-299)
 * @since 1.0.0
 * @example
 * ```typescript
 * if (isRequestSuccess(200)) {
 *   console.log('Request was successful');
 * }
 * ```
 */
export const isRequestSuccess = (statusCode: number): boolean => {
  return statusCode >= 200 && statusCode < 300;
};

/**
 * Checks if an HTTP status code indicates a client error
 * @param statusCode - The HTTP status code to check
 * @returns True if status code is in the 4xx range (400-499)
 * @since 1.0.0
 * @example
 * ```typescript
 * if (isClientError(404)) {
 *   console.log('Resource not found');
 * }
 * ```
 */
export const isClientError = (statusCode: number): boolean => {
  return statusCode >= 400 && statusCode < 500;
};

/**
 * Checks if an HTTP status code indicates a server error
 * @param statusCode - The HTTP status code to check
 * @returns True if status code is in the 5xx range (500-599)
 * @since 1.0.0
 * @example
 * ```typescript
 * if (isServerError(500)) {
 *   console.log('Internal server error');
 * }
 * ```
 */
export const isServerError = (statusCode: number): boolean => {
  return statusCode >= 500 && statusCode < 600;
};

/**
 * Logs HTTP errors to console with structured formatting and optional error tracking
 * @param error - The HTTP error to log
 * @since 1.0.0
 * @example
 * ```typescript
 * const error: HttpError = {
 *   type: ErrorType.NETWORK_ERROR,
 *   code: 'NETWORK_ERROR',
 *   message: 'Connection failed',
 *   timestamp: new Date().toISOString()
 * };
 * logError(error);
 * ```
 */
const logError = (error: HttpError): void => {
  // Create a collapsible console group for better error organization
  console.group(`🚨 HTTP Error [${error.type}]`);
  console.error('Error Details:', {
    type: error.type,
    code: error.code,
    message: error.message,
    timestamp: error.timestamp,
    url: error.url,
    method: error.method?.toUpperCase()
  });

  // Log original error for debugging purposes
  if (error.originalError) {
    console.error('Original Error:', error.originalError);
  }
  console.groupEnd();

  // In production environment, errors can be sent to monitoring services
  // This allows for centralized error tracking and alerting
  if (import.meta.env.PROD) {
    // Example: sendToErrorTracking(error);
    // Integration with services like Sentry, LogRocket, or custom analytics
  }
};

/**
 * Converts Axios errors into standardized HttpError objects with appropriate categorization
 * @param error - The Axios error to process
 * @returns Standardized HttpError object with categorized error information
 * @since 1.0.0
 * @throws {HttpError} Always throws the processed error for upstream handling
 * @example
 * ```typescript
 * try {
 *   await axios.get('/api/data');
 * } catch (axiosError) {
 *   const httpError = handleError(axiosError);
 *   console.log(httpError.type); // ErrorType.NETWORK_ERROR, etc.
 * }
 * ```
 */
const handleError = (error: AxiosError): HttpError => {
  const timestamp = new Date().toISOString();
  const url = error.config?.url;
  const method = error.config?.method;

  let httpError: HttpError;

  if (!error.response) {
    // Handle network errors or request cancellation
    // ECONNABORTED indicates a timeout error specifically
    if (error.code === 'ECONNABORTED') {
      httpError = {
        type: ErrorType.TIMEOUT_ERROR,
        code: 'TIMEOUT',
        message: '請求超時，請檢查網路連線',
        originalError: error,
        timestamp,
        url,
        method
      };
    } else {
      httpError = {
        type: ErrorType.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        message: '網路連線異常，請檢查網路設定',
        originalError: error,
        timestamp,
        url,
        method
      };
    }
  } else {
    // HTTP 狀態碼錯誤
    const { status, data } = error.response;

    switch (true) {
      case status === 401:
        httpError = {
          type: ErrorType.UNAUTHORIZED,
          code: status,
          message: '登入已過期，請重新登入',
          originalError: error,
          timestamp,
          url,
          method
        };
        // Fixed: Added null checking for store state
        try {
          const state = store.getState();
          if (state?.authSlice) {
            store.dispatch({ type: 'auth/logout' });
          }
          window.location.href = '/login';
        } catch (storeError) {
          console.error('Store access error:', storeError);
          window.location.href = '/login';
        }
        break;

      case status === 403:
        httpError = {
          type: ErrorType.FORBIDDEN,
          code: status,
          message: '權限不足，無法執行此操作',
          originalError: error,
          timestamp,
          url,
          method
        };
        break;

      case isClientError(status):
        httpError = {
          type: ErrorType.CLIENT_ERROR,
          code: status,
          message: (data as { message?: string })?.message || `客戶端錯誤 (${status})`,
          originalError: error,
          timestamp,
          url,
          method
        };
        break;

      case isServerError(status):
        httpError = {
          type: ErrorType.SERVER_ERROR,
          code: status,
          message: (data as { message?: string })?.message || '伺服器異常，請稍後再試',
          originalError: error,
          timestamp,
          url,
          method
        };
        break;

      default:
        httpError = {
          type: ErrorType.CLIENT_ERROR,
          code: status,
          message: (data as { message?: string })?.message || `未知錯誤 (${status})`,
          originalError: error,
          timestamp,
          url,
          method
        };
    }
  }

  return httpError;
};

/**
 * Displays user-friendly error messages using Ant Design's message component
 * Different error types are shown with appropriate styling and duration
 * @param error - The HTTP error to display
 * @since 1.0.0
 * @example
 * ```typescript
 * const error: HttpError = {
 *   type: ErrorType.NETWORK_ERROR,
 *   message: 'Connection failed'
 * };
 * showErrorMessage(error); // Shows red error message for 5 seconds
 * ```
 */
const showErrorMessage = (error: HttpError): void => {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
    case ErrorType.TIMEOUT_ERROR:
      // Network and timeout errors get longer display duration (5s)
      // as users may need more time to understand connectivity issues
      message.error({
        content: error.message,
        duration: 5,
        key: 'network-error'
      });
      break;

    case ErrorType.UNAUTHORIZED:
      // Auth errors use warning style and shorter duration (3s)
      // as they typically trigger automatic redirects
      message.warning({
        content: error.message,
        duration: 3,
        key: 'auth-error'
      });
      break;

    case ErrorType.FORBIDDEN:
      // Permission errors use warning style with moderate duration (4s)
      message.warning({
        content: error.message,
        duration: 4,
        key: 'permission-error'
      });
      break;

    case ErrorType.SERVER_ERROR:
      // Server errors get longest duration (6s) as they may require user action
      message.error({
        content: error.message,
        duration: 6,
        key: 'server-error'
      });
      break;

    case ErrorType.BUSINESS_ERROR:
      // Business logic errors use standard duration (4s)
      message.error({
        content: error.message,
        duration: 4,
        key: 'business-error'
      });
      break;

    default:
      // Fallback for unknown error types
      message.error({
        content: error.message,
        duration: 4,
        key: 'general-error'
      });
  }
};

/**
 * Extended Axios request configuration interface that includes retry count tracking
 * @since 1.0.0
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  /** Internal retry counter for tracking retry attempts */
  __retryCount?: number;
}

/**
 * Implements exponential backoff retry logic for failed HTTP requests
 * @param error - The Axios error that triggered the retry
 * @param config - Optional retry configuration, defaults to defaultRetryConfig
 * @returns Promise that resolves to the successful response or rejects with the final error
 * @throws {AxiosError} When max retries exceeded or retry condition not met
 * @since 1.0.0
 * @example
 * ```typescript
 * try {
 *   const response = await retryRequest(axiosError, {
 *     maxRetries: 2,
 *     retryDelay: 500,
 *     retryCondition: (err) => err.response?.status >= 500
 *   });
 * } catch (finalError) {
 *   // Handle final failure after all retries
 * }
 * ```
 */
const retryRequest = async (
  error: AxiosError,
  config: RetryConfig = defaultRetryConfig
): Promise<AxiosResponse> => {
  const { maxRetries, retryDelay, retryCondition } = config;
  const extendedConfig = error.config as ExtendedAxiosRequestConfig;
  const retryCount = extendedConfig?.__retryCount || 0;

  // Check if we should stop retrying based on:
  // 1. Max retries reached
  // 2. Retry condition not met (e.g., client error that shouldn't be retried)
  // 3. No config available (malformed request)
  if (retryCount >= maxRetries || !retryCondition(error) || !error.config) {
    throw error;
  }

  // Increment retry counter for tracking
  if (extendedConfig) {
    extendedConfig.__retryCount = retryCount + 1;
  }

  // Implement exponential backoff: delay increases exponentially with each retry
  // This helps reduce server load and increases success probability
  const delay = retryDelay * Math.pow(2, retryCount);

  console.log(`🔄 重試請求 (${retryCount + 1}/${maxRetries}) - ${error.config?.url}`);

  // Wait for the calculated delay before retrying
  await new Promise(resolve => setTimeout(resolve, delay));

  // Retry the original request using the same configuration
  return http.request(error.config);
};

/**
 * Main HTTP client instance with comprehensive error handling and retry logic
 * Configured with base URL, timeout, and default headers
 * @since 1.0.0
 * @example
 * ```typescript
 * // GET request
 * const users = await http.get('/api/users');
 *
 * // POST request with data
 * const newUser = await http.post('/api/users', { name: 'John' });
 *
 * // Request with custom headers
 * const data = await http.get('/api/data', {
 *   headers: { 'Custom-Header': 'value' }
 * });
 * ```
 */
const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor that adds metadata, authentication tokens, and logging
 * Automatically attaches JWT tokens from Redux store and generates unique request IDs
 * @since 1.0.0
 */
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate unique request ID and timestamp for tracking and debugging
    // This helps correlate requests with responses in logs
    config.metadata = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      startTime: Date.now()
    };

    // Safely attempt to add authentication token from Redux store
    // Uses try-catch to handle cases where store might not be available
    try {
      const state = store.getState();
      const token = state?.authSlice?.token;
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (storeError) {
      // Log warning but don't fail the request if store access fails
      console.warn('Unable to access store for token:', storeError);
    }

    // Log outgoing request details for debugging and monitoring
    console.log(`📤 Request [${config.metadata.requestId}]:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor that handles successful responses, business logic errors, and retry logic
 * Automatically processes API responses and implements comprehensive error handling
 * @since 1.0.0
 */
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { config, data, status } = response;
    const requestId = config.metadata?.requestId;
    const startTime = config.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    // Log successful response details for monitoring and debugging
    console.log(`📥 Response [${requestId}]:`, {
      status,
      duration: `${duration}ms`,
      url: config.url,
      data: data
    });

    // Check for business logic errors in API response
    // Many APIs return 200 status but include error codes in the response body
    if (data && typeof data === 'object' && 'code' in data) {
      if (!isRequestSuccess(data.code)) {
        const businessError: HttpError = {
          type: ErrorType.BUSINESS_ERROR,
          code: data.code,
          message: data.message || '業務邏輯錯誤',
          timestamp: new Date().toISOString(),
          url: config.url,
          method: config.method
        };

        // Log and display the business error
        logError(businessError);
        showErrorMessage(businessError);

        // Reject with structured error for consistent error handling
        return Promise.reject(businessError);
      }
    }

    // Return the response data (not the full response object)
    // This simplifies usage as consumers get the data directly
    return data;
  },
  async (error: AxiosError) => {
    const requestId = error.config?.metadata?.requestId;
    const startTime = error.config?.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    // Log error response details for debugging
    console.error(`❌ Response Error [${requestId}]:`, {
      duration: `${duration}ms`,
      status: error.response?.status,
      url: error.config?.url,
      error: error.message
    });

    // Attempt to retry the request based on retry configuration
    // This implements automatic retry for transient failures
    try {
      const retryResult = await retryRequest(error);
      return retryResult;
    } catch (retryError) {
      // All retries failed, process the error for user display
      const httpError = handleError(error);
      logError(httpError);
      showErrorMessage(httpError);

      // Reject with structured HttpError for consistent error handling
      return Promise.reject(httpError);
    }
  }
);

/**
 * Default export of the configured HTTP client instance
 * Ready to use with authentication, error handling, retry logic, and logging
 * @since 1.0.0
 * @see {@link http} for the main HTTP client instance
 */
export default http;

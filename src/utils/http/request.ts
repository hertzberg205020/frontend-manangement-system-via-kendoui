import http from './http';
import type { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * Request options for controlling HTTP behavior
 * Extends AxiosRequestConfig to allow passing any axios config options
 * @since 1.0.0
 */
export interface RequestOptions extends AxiosRequestConfig {
  /** Skip automatic error notification in HTTP interceptor (default: false) */
  skipErrorNotification?: boolean;
}

/**
 *  GET 請求
 *  @typeParam T - 回傳 data 的型別
 *  @param url - 請求的端點
 *  @param params - 查詢參數
 *  @param options - 請求選項
 *  @returns 回傳 ApiResponse<T>
 */
export function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return http.get(url, { params, ...options });
}

/**
 *  POST 請求
 *  @typeParam T - 回傳 data 的型別
 *  @typeParam D - the type of the data to be sent in the request
 *  @param url - 請求的端點
 *  @param data - 請求的資料
 *  @param options - 請求選項
 *  @returns 回傳 ApiResponse<T>
 */
export function post<T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return http.post(url, data, options);
}

/**
 *  PUT 請求
 *  @typeParam T - 回傳 data 的型別
 *  @typeParam D - the type of the data to be sent in the request
 *  @param url - 請求的端點
 *  @param data - 請求的資料
 *  @param options - 請求選項
 *  @returns 回傳 ApiResponse<T>
 */
export function put<T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return http.put(url, data, options);
}

/**
 *  DELETE 請求
 *  @typeParam T - 回傳 data 的型別
 *  @param url - 請求的端點
 *  @param params - 查詢參數
 *  @param options - 請求選項
 *  @returns 回傳 ApiResponse<T>
 */
export function del<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return http.delete(url, { params, ...options });
}

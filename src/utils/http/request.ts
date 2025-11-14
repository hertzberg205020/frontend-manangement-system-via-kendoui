import http from './http';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 *  GET 請求
 *  @typeParam T - 回傳 data 的型別
 *  @param url - 請求的端點
 *  @param params - 查詢參數
 *  @returns 回傳 ApiResponse<T>
 */
export function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return http.get(url, { params });
}

/**
 *  POST 請求
 *  @typeParam T - 回傳 data 的型別
 *  @typeParam D - the type of the data to be sent in the request
 *  @param url - 請求的端點
 *  @param data - 請求的資料
 *  @returns 回傳 ApiResponse<T>
 */
export function post<T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D
): Promise<ApiResponse<T>> {
  return http.post(url, data);
}

/**
 *  PUT 請求
 *  @typeParam T - 回傳 data 的型別
 *  @typeParam D - the type of the data to be sent in the request
 *  @param url - 請求的端點
 *  @param data - 請求的資料
 *  @returns 回傳 ApiResponse<T>
 */
export function put<T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D
): Promise<ApiResponse<T>> {
  return http.put(url, data);
}

/**
 *  DELETE 請求
 *  @typeParam T - 回傳 data 的型別
 *  @param url - 請求的端點
 *  @param params - 查詢參數
 *  @returns 回傳 ApiResponse<T>
 */
export function del<T = unknown>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return http.delete(url, { params });
}

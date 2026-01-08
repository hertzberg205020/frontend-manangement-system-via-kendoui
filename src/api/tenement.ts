import type { PaginatedResponse } from '@/types/PaginatedResponse';
import type { CreateTenementDataType, TenementDataType } from '@/types/tenement';
import { get, post, type ApiResponse } from '@/utils/http/request';

interface GetDataOption {
  page: number;
  pageSize: number;
}

/**
 * 取得 tenement 分頁資訊
 * @param option 查詢參數
 * @returns 分頁後的 tenement 資料
 */
export async function getData(option: GetDataOption): Promise<PaginatedResponse<TenementDataType>> {
  const response = await get<PaginatedResponse<TenementDataType>>('/tenement', {
    page: option.page,
    pageSize: option.pageSize,
  });

  if (response.code === 200) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch data');
}

export function upsertTenement(data: CreateTenementDataType): Promise<ApiResponse<string>> {
  return post('/tenement/upsert', data);
}

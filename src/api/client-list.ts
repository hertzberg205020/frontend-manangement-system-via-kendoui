import type { CompanyDataType } from '@/pages/users/interface';
import { get, post, type ApiResponse } from '@/utils/http/request';

export function getClientList(data: {
  name: string;
  phone: string;
  contact: string;
  page: number;
  pageSize: number;
}): Promise<
  ApiResponse<{
    list: CompanyDataType[];
    total: number;
  }>
> {
  return get('/client-list', data);
}

export function deleteClient(id: string): Promise<ApiResponse<string>> {
  return post('/client/delete', { id });
}

export function batchDeleteClient(ids: React.Key[]): Promise<ApiResponse<string>> {
  return post('/client/batch-delete', { ids });
}

type UpsertClientDataType = Omit<CompanyDataType, 'id'> & {
  id?: string; // 在新增時，ID 可以是可選的
};

export function upsertClient(data: UpsertClientDataType): Promise<ApiResponse<string>> {
  return post('/client/upsert', data);
}

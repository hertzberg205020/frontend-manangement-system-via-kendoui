import { get } from '@/utils/http/request';

export interface EnergyData {
  name: string;
  data: number[];
}

export function getEnergyData(): Promise<EnergyData[]> {
  return get<EnergyData[]>('/energy-data').then((response) => {
    if (response.code === 200) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch energy data');
    }
  });
}

import { getEnergyData, type EnergyData } from '@/api/dashboard';
import { useEffect, useMemo, useState } from 'react';
import initialEnergyData from './energy-figure-config';
import ReactECharts from 'echarts-for-react';

export const EnergyFigure: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetch energy data from API
    const loadingEnergyData = async () => {
      try {
        const res = await getEnergyData();
        if (!res || res.length === 0) {
          setError('No data available');
          return;
        }
        setEnergyData(res);
      } catch {
        setError('Failed to load energy data');
      } finally {
        setLoading(false);
      }
    };

    loadingEnergyData();
  }, []);

  /**
   * 建立能源圖表設定
   * @param data 能源資料陣列
   * @returns ECharts 的 option 物件
   */
  const buildEnergyChartConfig = (data: EnergyData[]): Record<string, unknown> => {
    if (!data.length) return initialEnergyData;

    return {
      ...initialEnergyData,
      legend: {
        data: data.map((item) => item.name),
      },
      series: data.map((item) => ({
        name: item.name,
        type: 'line',
        stack: 'Total',
        data: item.data,
      })),
    };
  };

  const energyConfig = useMemo(() => buildEnergyChartConfig(energyData), [energyData]);
  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && <ReactECharts option={energyConfig} />}
    </>
  );
};

export default EnergyFigure;

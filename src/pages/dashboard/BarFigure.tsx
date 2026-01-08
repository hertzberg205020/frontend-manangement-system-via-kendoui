import ReactECharts from 'echarts-for-react';

const option: Record<string, unknown> = {
  title: {
    text: 'Enterprise Qualification Status (Number)',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  legend: {
    top: '10%',
    left: 'center',
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: [0, 0.01],
    data: ['2014', '2016', '2018', '2020', '2022', '2024'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'Technology Enterprises',
      type: 'bar',
      data: [40, 220, 378, 658, 1122, 1200],
    },
    {
      name: 'High-tech Enterprises',
      type: 'bar',
      data: [20, 39, 443, 490, 559, 762],
    },
    {
      name: 'State-owned Enterprises',
      type: 'bar',
      data: [78, 167, 229, 330, 380, 420],
    },
  ],
};

const BarFigure: React.FC = () => {
  return (
    <>
      <ReactECharts option={option}></ReactECharts>
    </>
  );
};

export default BarFigure;

import ReactECharts from 'echarts-for-react';

const option: Record<string, unknown> = {
  legend: {
    top: '0%',
    left: 'center',
  },
  series: [
    {
      name: 'Nightingale Chart',
      type: 'pie',
      radius: [30, 100],
      center: ['50%', '60%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 8,
      },
      data: [
        { value: 40, name: 'Operating' },
        { value: 38, name: 'Leased' },
        { value: 32, name: 'For Rent' },
        { value: 30, name: 'Renewed' },
        { value: 28, name: 'Newly Signed' },
        { value: 26, name: 'Available for Rent' },
        { value: 22, name: 'Lease Terminated' },
      ],
    },
  ],
};

const PieFigure: React.FC = () => {
  return (
    <>
      <ReactECharts option={option}></ReactECharts>
    </>
  );
};

export default PieFigure;

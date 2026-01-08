const energyFigureConfig = {
  title: {
    text: 'Daily Energy',
    left: 'left',
    top: 0, // 或 '2%'
  },
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: [],
    top: 'auto', // 或 '8%'
  },
  grid: {
    left: '%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  toolbox: {
    feature: {
      saveAsImage: {},
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  },
  yAxis: {
    type: 'value',
  },
  series: [],
};

export default energyFigureConfig;

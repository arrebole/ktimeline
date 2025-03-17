import "./indicator";
import "./overlay";
import { init, Chart, KLineData } from 'klinecharts';

export function createChart(
  ds: HTMLElement | string,
  data: KLineData[],
) {
  const chart = init(ds, {
    styles: {
      grid: {
        show: false
      },
      candle: {
        bar: {
          upColor: '#F92855',
          upBorderColor: '#F92855',
          upWickColor: '#F92855',
          downColor: '#2DC08E',
          downBorderColor: '#2DC08E',
          downWickColor: '#2DC08E',
          noChangeColor: '#888888',
          noChangeBorderColor: '#888888',
          noChangeWickColor: '#888888'
        },
        tooltip: {
          custom: [
            { title: '', value: '{time}' },
            { title: '开：', value: '{open}' },
            { title: '高：', value: '{high}' },
            { title: '低：', value: '{low}' },
            { title: '收：', value: '{close}' },
            { title: '量：', value: '{volume}' }
          ]
        }
      },
    }
  })!;

  // 获取K线数据创建K线图
  chart.applyNewData(data);

  // 为K线图增加指标
  chart.createIndicator("MYMA", false, {
    id: 'candle_pane'
  });
  chart.createIndicator("MYVOL", false, {
    height: 50,
  });
  return chart;
}

// 创建提示标签
export function randerOverlays(chart: Chart, indexItems: any[]) {
  chart.removeOverlay();

  for (const item of indexItems) {
    const kline = chart.getDataList().find(
      (k) => k.timestamp == item.timestamp
    );
    if (!kline) {
      continue;
    }
    chart.createOverlay({
      name: 'annotation',
      extendData: item.symbol,
      styles: {
        text: { size: 10 },
      },
      points: [{
        timestamp: kline.timestamp,
        value: kline.high,
      }]
    });
  }
}
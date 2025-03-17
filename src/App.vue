<template>
  <main class="main">
    <div id="slide" ref="noteContent"></div>
    <div id="chart"/>
  </main>
</template>

<script setup lang="ts">
import './extension';
import dayjs from 'dayjs'
import { ref, onMounted, onUnmounted } from "vue";
import { init, dispose, ActionType } from 'klinecharts';
import { fetchKlineData, fetchIndex, fetchNoteContent } from './api';
import { debounce } from './utils';

const noteContent = ref<HTMLElement>();

function createChart(ds: HTMLElement | string) {
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
  return chart;
}

async function onCrosshairChange(data: any) {
  const date = dayjs(data.timestamp).format('YYYYMMDD');

  const elements = await fetchNoteContent(date);
  if (!Array.isArray(elements)) {
    return
  }

  const container = document.createElement('div');
  for (const el of elements) {
    container.appendChild(el);
  }
  // 将新元素插入到容器中
  noteContent.value!.replaceChildren(container);
}

onMounted(async () => {
  const chart = createChart("chart");

  // 获取K线数据创建K线图
  const klinesData = await fetchKlineData();
  chart.applyNewData(klinesData);

  // 为K线图增加指标
  chart.createIndicator("MYMA", false, {
    id: 'candle_pane'
  });
  chart.createIndicator("MYVOL", false, {
    height: 50,
  });

  // 获取笔记列表 创建K线图中的提示标签
  const indexItems = await fetchIndex();
  for (const item of indexItems) {
    const kline = klinesData.find(
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

  // 监控 十字准线改变时
  chart.subscribeAction(
    ActionType.OnCrosshairChange, 
    debounce(onCrosshairChange, 300, false),
  );
});

onUnmounted(() => {
  dispose('chart')
})
</script>

<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

html, body, #app {
  margin: 0;
  width:100%;
  height: 100%;
}

.main {
  display: flex;
  /* 垂直排列 */
  flex-direction: row;
  height: 100vh;
  width: 100vw;
}

#slide {
  padding: 8px;
  margin: 8px;
  border-right: 1px dotted #f6f6f6;
  font-size: 10px;
  width: 200px;
}

#chart {
  padding: 8px;
  margin-left: 5px;
  flex-grow: 1;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #161618;
  }
}

</style>
<template>
  <main class="main">
    <div id="slide" ref="noteContent"></div>
    <div id="chart"/>
  </main>
</template>

<script setup lang="ts">
import './indicator';
import { ref, onMounted, onUnmounted } from "vue";
import { init, dispose, ActionType } from 'klinecharts';
import { fetchKlineData, fetchIndex, fetchNoteContent } from './api';

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
            { title: '时：', value: '{time}' },
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
    const extendData = [];
    if (item.up) {
      extendData.push(item.up + "↑");
    }
    if (item.down) {
      extendData.push(item.down + "↓")
    }
    chart.createOverlay({
      name: 'simpleAnnotation',
      extendData: extendData.join(""),
      styles: {
        text: { size: 9 }
      },
      points: [{ 
        timestamp: kline.timestamp, 
        value: Math.max(kline.open, kline.close), 
      }]
    });
  }

  // 监控 十字准线改变时
  chart.subscribeAction(ActionType.OnCrosshairChange, async (data: any) => {
    const date = new Date(data.timestamp)
      .toISOString()
      .substring(0, 10)
      .replace(/-/g, "");

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
  });
})

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
<template>
  <main class="main">
    <div id="chart"/>
  </main>
</template>

<script setup lang="ts">
import './indicator';
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { init, dispose } from 'klinecharts';

function convertToTimestamp(dateStr: string) {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  // 使用 UTC 时间
  const date = new Date(+year, +month - 1, +day);
  // 获取时间戳
  return date.getTime();
}

async function fetchKlineData() {
  const content: String = await invoke("find_klines", { 
    code: "sh999999" 
  });

  return content
    .split("\n")
    .filter(l => l.length > 0)
    .map(v => v.split(","))
    .map((rows)=>{
        return {
          timestamp: convertToTimestamp(rows[0]),
          open: +rows[1]/100,
          high: +rows[2]/100,
          low: +rows[3]/100,
          close: +rows[4]/100,
          volume: +rows[6],
        }
    });
}

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
  chart.createOverlay({
      name: 'simpleAnnotation',
      extendData: '白酒',
      points: [{ 
        timestamp: klinesData[klinesData.length-1].timestamp, 
        value: klinesData[klinesData.length-1].high, 
      }]
  })
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
  flex-direction: column; 
  /* 垂直居中 */
  justify-content: center; 
  /* 水平居中 */
  align-items: center; 
  height: 100vh;
  width: 100vw;
}

#chart {
  flex-grow: 1;
  height: 100vh;
  width: 100vw;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #161618;
  }
}

</style>
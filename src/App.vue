<template>
  <main class="main">
    <div id="chart"/>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { init, dispose } from 'klinecharts';

function convertToTimestamp(dateStr) {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  // 使用 UTC 时间
  const date = new Date(Date.UTC(year, month - 1, day));
  // 获取时间戳
  const timestamp = date.getTime();
  return timestamp;
}

async function fetchKlineData() {
  const content = await invoke("find_klines", { 
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

onMounted(async () => {
  const chart = init('chart');
  chart.createIndicator("MA", false, {
    id: 'candle_pane'
  });
  chart.createIndicator("VOL", false, {
    height: 60,
  });
  const klineData = await fetchKlineData();
  chart.applyNewData(klineData);
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
    background-color: #2f2f2f;
  }
}

</style>
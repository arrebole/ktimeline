<template>
  <main class="main">
    <div id="slide">
      <div class="slide-header">
        <div class="current-date">{{ currentDate }}</div>
        <input 
          id="symbol-input" 
          v-model="currentSymbol"
          placeholder="..."
          autocomplete="off"
          @blur="handleUpdateSymbol"
          @keyup.enter="handleEnter"
        />
      </div>
      <div id="noteContent" ref="noteContent"></div>
    </div>
    <div id="chart"/>
  </main>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { createChart, randerOverlays } from './klineChart';
import { ref, onMounted, onUnmounted } from "vue";
import { dispose, Chart, ActionType } from 'klinecharts';
import { debounce } from './utils';
import { fetchIndex, fetchKlineData, fetchNoteContent, IndexItem, updateIndex } from './api';

const klineChart = ref<Chart>();
const noteContent = ref<HTMLElement>();
const indexData = ref<IndexItem[]>([]);
const currentTimestamp = ref<number>(0);
const currentSymbol = ref<string>();
const currentDate = ref<string>();

// 通过时间查询本地缓存中的标记
const findSymbol = (timestamp: number) => {
  return indexData.value.find(v => v.timestamp == timestamp)?.symbol;
}

// 移除输入框的焦点
const handleEnter = (event: KeyboardEvent) => {
  // @ts-ignore
  event.target!.blur();
};

// 更新标记
const handleUpdateSymbol = async (payload: FocusEvent) => {
  // @ts-ignore
  const updateSymbol = payload.target.value;

  if (updateSymbol != findSymbol(currentTimestamp.value)) {
    await updateIndex(
      dayjs(currentTimestamp.value).format('YYYYMMDD'), 
      updateSymbol,
    );
    // 刷新列表
    indexData.value = await fetchIndex();
    randerOverlays(klineChart.value!, indexData.value);
  }
}

// 监控 十字准线改变时, 获取当天的笔记数据
const onCrosshairChange = async (data: any) => {
  currentTimestamp.value = data.timestamp;
  currentDate.value =  dayjs(data.timestamp).format('YYYY-MM-DD')

  // 1更新笔记
  const elements = await fetchNoteContent(
    dayjs(data.timestamp).format('YYYYMMDD')
  );
  if (!Array.isArray(elements)) {
    return
  }
  const container = document.createElement('div');
  for (const el of elements) {
    container.appendChild(el);
  }
  // 将新元素插入到容器中
  noteContent.value!.replaceChildren(container);

  // 2更新标记
  currentSymbol.value = findSymbol(currentTimestamp.value);
}

onMounted(async () => {
  const klinesData = await fetchKlineData();
  indexData.value = await fetchIndex();
  klineChart.value = await createChart("chart", klinesData);

  randerOverlays(klineChart.value!, indexData.value);

  klineChart.value.subscribeAction(
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
  width: 100%;
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
  padding: 3px;
  margin: 3px;
  border-right: 1px dotted #f6f6f6;
  font-size: 10px;
  width: 200px;
  overflow: scroll;
}

.slide-header {
  border-bottom: 1px dotted #7c7c7c;
  padding-bottom: 2px;
}

.current-date {
  color: rgb(196, 196, 196);
  text-align: center;
}

#noteContent{
  padding: 5px;
}

#symbol-input {
  background-color: #161618;
  color: rgb(243, 106, 42);
  box-sizing: border-box;
  text-align: center;
  border: none;
  padding: 5px;
  width: 100%;
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

 /* 滚动条样式 */
 div::-webkit-scrollbar {
  width: 2px;
  height: 1px;
}

div::-webkit-scrollbar-thumb {
  border-radius: 4px;
  box-shadow: inset 0 0 5px rgba(182, 176, 176, 0.2);
  background: #d1d1d1;
}

div::-webkit-scrollbar-track {
  box-shadow: none;
  border-radius: 4px;
  background: transparent;
}

textarea::-webkit-scrollbar {
  display: none;
}

</style>
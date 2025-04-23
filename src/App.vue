<template>
  <main class="main">
    <div id="slide">
      <div class="slide-header">
        <div class="current-date">{{ currentDate }}</div>
        <div class="current-block"> {{ currentBlock }} </div>
      </div>
      <div class="contents" v-if="currentCoreDriver && currentCoreDriver.length > 0">
        <div v-for="item in currentCoreDriver">
          <p>
            <div>【择时环境】</div>
            <div class="contents-text">{{ item.environment }}</div>
          </p>

          <p>
            <div>【核心板块】</div>
            <div class="contents-text">{{ item.block }}</div>
          </p>

          <p>
            <div>【事件驱动】</div>
            <div class="contents-text">{{ item.event }}</div>
          </p>

          <p>
            <div>【老龙】</div>
            <div class="contents-text">
              <span class="span-item" v-for="i in item.oldDragon">{{ i }}</span>
            </div>
          </p>

          <p>
            <div>【资金一致性】</div>
            <div class="contents-text">
              <span class="span-item" v-for="i in item.active">{{ i }}</span>
            </div>
          </p>

          <p>
            <div>【构造买点】</div>
            <div class="contents-text">
              <span class="span-item" v-for="i in item.ready">{{ i }}</span>
            </div>
          </p>

          <p>
            <div>【本轮新龙】</div>
            <div class="contents-text">
              <span class="span-item" v-for="i in item.newDragon">{{ i }}</span>
            </div>
          </p>
        </div>
      </div>
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
import { fetchKlineData, fetchTimelines, CoreDriver } from './api';

const klineChart = ref<Chart>();
const timelineData = ref<CoreDriver[]>([]);

const currentTimestamp = ref<number>(0);
const currentDate = ref<string>();
const currentBlock = ref<string>();
const currentCoreDriver = ref<CoreDriver[]>();

// 监控 十字准线改变时, 获取当天的笔记数据
const onCrosshairChange = async (data: any) => {
  currentTimestamp.value = data.timestamp;
  currentDate.value =  dayjs(data.timestamp).format('YYYY-MM-DD')

  let coreDriver = [];
  for (const item of timelineData.value) {
    if (item.timestamp == data.timestamp) {
      coreDriver.push(item)
    }
  }
  currentBlock.value = coreDriver.map(v=>v.block).join("/");
  currentCoreDriver.value = coreDriver;
}

onMounted(async () => {
  const klinesData = await fetchKlineData();
  timelineData.value = await fetchTimelines();
  klineChart.value = await createChart("chart", klinesData);

  randerOverlays(klineChart.value!, timelineData.value);

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
  font-family: 'Microsoft YaHei', 'SimHei', 'YouYuan';
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
  flex-direction: row;
  height: 100vh;
  width: 100vw;
}

#slide {
  padding: 3px;
  margin: 3px;
  width: 200px;
  border-right: 1px dotted #f6f6f6;
  overflow: scroll;
}

.slide-header {
  border-bottom: 1px dotted #7c7c7c;
  padding-bottom: 2px;
}

.current-date {
  font-size: 0.5rem;
  color: rgb(196, 196, 196);
  text-align: center;
}

.current-block {
  font-size: 1rem;
  background-color: #161618;
  color: rgb(243, 106, 42);
  box-sizing: border-box;
  text-align: center;
  border: none;
  padding: 5px;
  width: 100%;
}

.contents{
  padding: 5px;
  font-size: 0.7rem;
  border-bottom: 1px solid #7c7c7c;
}

.contents-text{
  text-indent: 0.3rem;
}

.span-item {
  color: #e2a626;
  margin: 1px;
  padding: 1px;
  border-radius: 8%;
  border: 1px solid #7c7c7c;
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
<template>
  <div class="container">
    <!-- 左侧模块 -->
    <div class="left-module">
      <div class="module-content">
        <div class="icon-text-container">
          <el-icon size="32px" style="color: #2d7dbc">
            <Tickets />
          </el-icon>
          <span class="section-title">磨煤机结构</span>
        </div>
        <div class="image-container">
          <img src="@/assets/structure.png" alt="Structure" />
        </div>
      </div>
    </div>

    <!-- 右侧模块 -->
    <div class="right-modules">
      <div class="top-right-module">
        <div class="module-content">
          <div class="icon-text-container">
            <el-icon size="32px" style="color: #2d7dbc">
              <Money />
            </el-icon>
            <span class="section-title">参数波动</span>
          </div>
          <table class="kv-table">
            <tr v-for="(row, rowIndex) in formattedFlowData" :key="rowIndex">
              <td v-for="(value, key) in row" :key="key">
                <strong>{{ key }}:</strong> {{ value }}
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div class="bottom-right-module">
        <div class="module-content">
          <div class="icon-text-container">
            <el-icon size="32px" style="color: #2d7dbc">
              <Ship />
            </el-icon>
            <span class="section-title">机组负荷变化</span>
          </div>

          <!-- <h3>机组负荷变化</h3> -->
          <div ref="loadChart" class="chart" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import io from "socket.io-client";
import { trigger } from "@/api/welcome";

defineOptions({
  name: "Welcome"
});

const flowData = ref<Record<string, any>>({});
const loadData = ref<{ time: string; value: number }[]>([]);
const loadChart = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const getCurrentTime = (): string => {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
};

const formatFlowData = (data: Record<string, any>) => {
  const entries = Object.entries(data);
  const formatted = [];
  for (let i = 0; i < entries.length; i += 4) {
    formatted.push(Object.fromEntries(entries.slice(i, i + 4)));
  }
  return formatted;
};

const formattedFlowData = ref(formatFlowData(flowData.value));

const initChart = () => {
  if (loadChart.value) {
    chartInstance = echarts.init(loadChart.value);
    chartInstance.setOption({
      // title: {
      //   text: '机组负荷变化'
      // },
      tooltip: {
        trigger: "axis"
      },
      xAxis: {
        type: "category",
        data: loadData.value.map(item => item.time)
      },
      yAxis: {
        type: "value",
        min: () =>
          Math.floor(Math.min(...loadData.value.map(item => item.value))) - 5 // 让纵坐标从负载的最小值开始，并向下取整
      },
      series: [
        {
          data: loadData.value.map(item => item.value),
          type: "line",
          smooth: true
        }
      ]
    });
  }
};

const socket = io("http://127.0.0.1:5005/welcome", {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("WebSocket connected welcome");
});

socket.on("connect_error", error => {
  console.error("WebSocket connection welcome error:", error);
});

socket.on("disconnect", () => {
  console.log("WebSocket disconnected welcome");
});

socket.on("update_data", (newData: Record<string, any>) => {
  const { 机组负荷: load, ...flow } = newData;
  loadData.value.push({ time: getCurrentTime(), value: load });
  flowData.value = flow;
  formattedFlowData.value = formatFlowData(flowData.value);

  if (chartInstance) {
    chartInstance.setOption({
      xAxis: {
        data: loadData.value.map(item => item.time)
      },
      series: [
        {
          data: loadData.value.map(item => item.value)
        }
      ]
    });
  }
});

onMounted(async () => {
  await trigger()
    .then(response => {
      console.log(response.message);
    })
    .catch(error => {
      console.error("Error triggering data stream:", error);
    });

  nextTick(() => {
    initChart();
  });
});

onUnmounted(() => {
  socket.close();
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
.container {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 80vh;
  padding: 20px;
  background-color: #2d7dbc;
}

/* 左侧模块样式 */
.left-module {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  background-color: white;
  border-radius: 8px;
}

.module-content {
  display: flex;
  flex-direction: column; /* 修改 flex 方向为列 */
  align-items: flex-start; /* 改为靠左对齐 */
  justify-content: flex-start; /* 改为靠上对齐 */
  width: 100%;
  height: 100%;
  padding: 10px;
}

.icon-text-container {
  display: flex;
  gap: 10px; /* 设置图标和文本之间的间隙 */
  align-items: center;
  justify-content: flex-start; /* 改为靠左对齐 */
  margin-bottom: 10px; /* 设置与图片之间的间隙 */
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.section-title {
  font-size: 24px;
  color: #2d7dbc;
}

/* 右侧模块样式 */
.right-modules {
  display: flex;
  flex: 2;
  flex-direction: column;
  max-height: 96%;
}

.top-right-module,
.bottom-right-module {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
}

.bottom-right-module {
  margin-bottom: 0;
}

img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
  object-fit: contain;
}

.kv-table {
  width: 100%;
  border-collapse: collapse;
}

.kv-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

.kv-table td strong {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.kv-table tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.kv-table tr:nth-child(even) {
  background-color: #fff;
}

.chart {
  width: 100%;
  height: 100%;
  max-height: 100%;
}

h3 {
  text-align: center;
}
</style>

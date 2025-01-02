<template>
  <div class="container">
    <!-- 左边部分 -->
    <div class="left-panel">
      <div class="icon-text-container">
        <el-icon size="32px" style="color: #2d7dbc">
          <Histogram />
        </el-icon>
        <span class="section-title">参数波动</span>
      </div>
      <!-- 参数波动内容 -->
      <div class="flow-data-container">
        <div v-for="(value, key) in flowData" :key="key" class="flow-item">
          <div class="flow-label">{{ key }}</div>
          <el-progress :percentage="getPercentage(key, value)" :status="getStatus(key, value)" show-text />
          <div class="flow-value">{{ value }}</div>
        </div>
      </div>
    </div>

    <!-- 右边部分 -->
    <div class="right-panel">
      <div class="right-top">
        <div class="icon-text-container">
          <el-icon size="32px" style="color: #2d7dbc">
            <Operation />
          </el-icon>
          <span class="section-title">矿产加工多工序生产全流程高精度建模</span>
        </div>
        <div class="image-container">
          <el-tooltip effect="dark" placement="right" content="智能机器人问答">
            <div class="robot-container img-hover" @click="goToRobotPage()" />
          </el-tooltip>
          <el-tooltip effect="dark" placement="left">
            <template #content>
              <div>
                磨煤机<br />
                输入变量：<br />
                输出变量：
              </div>
            </template>
            <div class="momeiji img-hover" @click="handleClick('磨煤机')" />
          </el-tooltip>
          <el-tooltip effect="dark" placement="right">
            <template #content>
              <div>
                锅炉燃烧<br />
                输入变量：<br />
                输出变量：
              </div>
            </template>
            <div class="guoluranshao img-hover" @click="handleClick('锅炉燃烧')" />
          </el-tooltip>
          <el-tooltip effect="dark" placement="left">
            <template #content>
              <div>
                煤分选机<br />
                输入变量：<br />
                输出变量：
              </div>
            </template>
            <div class="meifenxuanji img-hover" @click="goToCoalGangueSortingPage()" />
          </el-tooltip>
          <el-tooltip effect="dark" placement="left">
            <template #content>
              <div>
                给煤机<br />
                输入变量：<br />
                输出变量：
              </div>
            </template>
            <div class="geimeiji img-hover" @click="handleClick('给煤机')" />
          </el-tooltip>
          <el-tooltip effect="dark" placement="left">
            <template #content>
              <div>
                给风机<br />
                输入变量：<br />
                输出变量：
              </div>
            </template>
            <div class="geifengji img-hover" @click="handleClick('给风机')" />
          </el-tooltip>
          <el-tooltip effect="dark" placement="right">
            <template #content>
              <div>
                锅炉进口空预器<br />
                输入变量：<br />
                输出变量：
              </div>
            </template>
            <div class="kongyuqi img-hover" @click="handleClick('锅炉进口空预器')" />
          </el-tooltip>
          <el-tooltip effect="dark" placement="right">
            <template #content>
              <div>
                进水系统<br />
                输入变量：<br />
                输出变量：
              </div>
            </template>
            <div class="jinshuixitong img-hover" @click="handleClick('进水系统')" />
          </el-tooltip>
        </div>
      </div>
      <div class="right-bottom">
        <div class="module-content">
          <div class="icon-text-container">
            <el-icon size="32px" style="color: #2d7dbc">
              <Ship />
            </el-icon>
            <span class="section-title">机组负荷变化</span>
          </div>
          <div ref="loadChart" class="chart" />
        </div>
      </div>
    </div>

    <!-- 抽屉组件 -->
    <div v-if="showDrawer" class="drawer" @close="closeDrawer">
      <div class="drawer-header">
        <h2>{{ selectedButton }} - 模型训练配置</h2>
        <button class="close-button" @click="closeDrawer">×</button>
      </div>
      <div class="drawer-content">
        <!-- 数据导入部分 -->
        <div class="drawer-section">
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
              <FolderAdd />
            </el-icon>
            <span class="section-title">数据导入</span>
          </div>
          <div class="file-upload">
            <div class="file-input-container">
              <p style="margin: 0; font-weight: bolder">请选择输入数据集</p>
              <input type="file" class="file-input" @change="handleInputFileUpload" />
              <button @click="uploadInputFile">点击上传</button>
            </div>
          </div>
          <div class="file-upload">
            <div class="file-input-container">
              <p style="margin: 0; font-weight: bolder">请选择输出数据集</p>
              <input type="file" class="file-input" @change="handleOutputFileUpload" />
              <button @click="uploadOutputFile">点击上传</button>
            </div>
          </div>
          <div class="analysis-section">
            <el-button type="primary" size="large" class="analysis-btn"  style="width: 200px; margin-left: 50px;" @click="handleShowAnalysisDrawer">关联分析</el-button>
            <el-button type="primary" size="large" class="analysis-btn" style="width: 200px;" >因果分析</el-button>

            <!-- 模型选择 -->
            <el-form label-width="100px" class="model-selection-form">
              <el-form-item label="模型选择" style="margin-top: 20px;">
                <el-radio-group v-model="radio" class="radio-group">
                  <el-radio :label="3">随机森林</el-radio>
                  <el-radio :label="6">多空间模型</el-radio>
                  <el-radio :label="9">多时间模型</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 参数配置部分 -->
        <div class="drawer-section">
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
              <Setting />
            </el-icon>
            <span class="section-title">参数配置</span>
          </div>

          <!-- 参数配置表单 -->
          <el-form :model="currentParameters" label-width="150px" class="parameter-config-form">
            <!-- 随机森林参数 -->
            <div v-if="radio === 3">
              <el-form-item label="决策树数量">
                <el-input-number v-model="parameterConfig.randomForest.decisionTreeCount" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="树的最大深度">
                <el-input-number v-model="parameterConfig.randomForest.maxDepth" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="最小样本分割数">
                <el-input-number v-model="parameterConfig.randomForest.minSamplesSplit" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="最小叶子节点数">
                <el-input-number v-model="parameterConfig.randomForest.minSamplesLeaf" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
            </div>

            <!-- 多空间模型参数 -->
            <div v-if="radio === 6">
              <el-form-item label="迭代次数">
                <el-input-number v-model="parameterConfig.multiSpaceModel.iterations" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="历史数据">
                <el-input-number v-model="parameterConfig.multiSpaceModel.historicalData" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="预测数据">
                <el-input-number v-model="parameterConfig.multiSpaceModel.predictionData" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="节点个数">
                <el-input-number v-model="parameterConfig.multiSpaceModel.nodeCount" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="数据的邻接矩阵">
                <el-input v-model="parameterConfig.multiSpaceModel.adjacencyMatrix" placeholder="请输入邻接矩阵"></el-input>
              </el-form-item>
            </div>

            <!-- 多时间模型参数 -->
            <div v-if="radio === 9">
              <el-form-item label="迭代次数">
                <el-input-number v-model="parameterConfig.multiTimeModel.iterations" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="学习率">
                <el-input-number v-model="parameterConfig.multiTimeModel.learningRate" :min="0.0001" :step="0.0001" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="训练权重衰减系数">
                <el-input-number v-model="parameterConfig.multiTimeModel.weightDecay" :min="0" :step="0.0001" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="模型输入尺寸">
                <el-input-number v-model="parameterConfig.multiTimeModel.inputSize" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item label="模型输出尺寸">
                <el-input-number v-model="parameterConfig.multiTimeModel.outputSize" :min="1" :step="1" style="width: 100%;"></el-input-number>
              </el-form-item>
            </div>

            <el-form-item>
              <el-button type="primary" @click="applyParameters">应用参数</el-button>
              <el-button type="primary" @click="resetParameters" style="margin-left: 20px;">重置</el-button>
              <el-button type="primary" @click="trainModel" style="margin-left: 20px;">模型训练</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 模型管理部分 -->
        <div class="drawer-section">
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
              <Box />
            </el-icon>
            <span class="section-title">模型管理</span>
          </div>
          <!-- 模型管理 -->
          <div class="model-management">
            <el-table :data="models" style="width: 100%" :border="true" :size="'default'">
              <el-table-column prop="name" label="模型名称" width="200"></el-table-column>
              <el-table-column label="操作" width="500">
                <template #default="scope">
                  <el-button type="primary" size="small" plain @click="displayModel(scope.row)"
                    icon="Search">模型展示</el-button>
                  <el-button type="primary" size="small" plain @click="explainModel(scope.row)"
                    style="margin-left: 10px" icon="Share">模型解释</el-button>
                  <el-button type="danger" size="small" plain icon="Delete" @click="deleteModel(scope.row)"
                    style="margin-left: 10px">删除</el-button>
                  <el-button type="info" size="small" plain @click="downloadModel(scope.row)" style="margin-left: 10px"
                    icon="Download">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 模型展示部分 -->
        <div class="drawer-section">
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
              <Monitor />
            </el-icon>
            <span class="section-title">模型展示</span>
          </div>
          <!-- 模型展示内容 -->
          <div class="model-display">
            <!-- 显示 MSE 和 R² -->
            <div class="performance-metrics">
              <span><strong>MSE:</strong>
                {{ modelPerformance.MSE !== null ? modelPerformance.MSE : "待计算" }}</span>
              <span><strong>R²:</strong>
                {{ modelPerformance.R2 !== null ? modelPerformance.R2 : "待计算" }}</span>
            </div>
            <!-- 模型对比图占位 -->
            <div class="chart-placeholder">
              <img v-if="modelPerformance.Base64Image" :src=" 'data:image/png;base64,' + modelPerformance.Base64Image" alt="模型对比图" />
              <div v-else class="placeholder">
                <span>模型真值与拟合值对比图</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 关联分析的弹窗 -->
        <el-dialog
            title="关联分析结果"
            v-model="analysisResultDialogVisible"
            width="1200px"
        >
            <div class="analysis-result-container">
                <div class="analysis-table-container">
                    <el-table :data="analysisTableData" style="width: 100%" :border="true" :size="'default'">
                        <el-table-column prop="Feature" label="特征" width="200"></el-table-column>
                        <el-table-column prop="RelationDegree" label="关联度" width="200"></el-table-column>
                    </el-table>
                </div>
                <div class="analysis-image-container">
                    <img v-if="analysisImageBase64" :src="'data:image/png;base64,' + analysisImageBase64" alt="关联分析结果图" style="width: 100%; height: auto; max-height: 400px;">
                    <div v-else class="placeholder">
                        <span>暂无关联分析结果图</span>
                    </div>
                </div>
            </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import { useRouter } from 'vue-router'
import * as echarts from "echarts";
import io from "socket.io-client";
import "element-plus/dist/index.css";
import { trigger, uploadLocalFile, onlineTrain_rf, getModelList, modelShow, deleteMultiLayerModel, downloadMultiLayerModel, grayCorrelationAnalysis  } from "@/api/welcome";

import {
  ElMessage,
  ElMessageBox,
  ElButton,
  ElSwitch,
  ElRadio,
  ElRadioGroup,
  ElIcon,
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElInputNumber,
  ElTable,
  ElTableColumn,
  ElProgress
} from "element-plus";

// 组件名称
defineOptions({
  name: "Welcome"
});

const router = useRouter()

const MAX_DATA_POINTS = 50; // 限制数据点数量
const flowData = ref<Record<string, any>>({});
const loadData = ref<{ time: string; value: number }[]>([]);
const loadChart = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 预定义每个参数的最大值
const MAX_VALUES: Record<string, number> = {
  给煤量: 100,
  磨煤机电机轴承温度: 100,
  磨煤机电机线圈温度: 100,
  磨煤机进口风压力: 10,
  磨煤机推力瓦温度: 100,
  磨煤机润滑油箱温度: 100,
  磨煤机加载油压力: 10,
  磨煤机电流: 100,
  磨煤机出口风粉温度: 100,
  磨煤机冷一次风档板阀位反馈: 100,
  磨煤机热一次风档板阀位反馈: 100,
  磨煤机进口风温度: 250,
  磨煤机一次风流量: 100,
  磨煤机出口风粉压力: 5
};

const getCurrentTime = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
};

// 初始化ECharts实例
const initChart = () => {
  if (loadChart.value) {
    chartInstance = echarts.init(loadChart.value);
    chartInstance.setOption({
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
          Math.floor(Math.min(...loadData.value.map(item => item.value))) - 5
      },
      dataZoom: [
        {
          type: "slider",
          start: 0,
          end: 100
        }
      ],
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

// 更新ECharts实例的数据
const updateChart = () => {
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
};

// 根据最大值计算百分比
const getPercentage = (key: string, value: number): number => {
  const max = MAX_VALUES[key] || 100;
  let percentage = (value / max) * 100;
  if (percentage > 100) percentage = 100;
  return Math.round(percentage);
};

// 根据百分比返回状态
const getStatus = (
  key: string,
  value: number
): "success" | "warning" | "exception" | "" => {
  const percentage = getPercentage(key, value);
  if (percentage < 50) {
    return "success";
  } else if (percentage < 80) {
    return "warning";
  } else {
    return "exception";
  }
};

// 建立WebSocket连接
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

  // 限制数据点数量
  if (loadData.value.length > MAX_DATA_POINTS) {
    loadData.value.shift();
  }

  flowData.value = flow;
  updateChart();
});

// 抽屉相关响应式变量
const showDrawer = ref(false);
const selectedButton = ref("");
const radio = ref(3); // 默认选中为3（随机森林）
const value2 = ref(false); // 开关初始值
const inputFile = ref<File | null>(null);
const outputFile = ref<File | null>(null);
let paramsToSend = {};
const analysisResultDialogVisible = ref(false);
const analysisTableData = ref([]);
const analysisImageBase64 = ref('');

// parameterConfig对象，用于不同类型模型参数配置
const parameterConfig = ref({
  randomForest: {
    decisionTreeCount: 100,
    maxDepth: 10,
    minSamplesSplit: 2,
    minSamplesLeaf: 1,
  },
  multiSpaceModel: {
    iterations: 1000,
    historicalData: 10,
    predictionData: 5,
    nodeCount: 50,
    adjacencyMatrix: '',
  },
  multiTimeModel: {
    iterations: 500,
    learningRate: 0.01,
    weightDecay: 0.0001,
    inputSize: 128,
    outputSize: 64,
  }
});

const models = ref([]);

const modelPerformance = ref({
  MSE: null,
  R2: null,
  Base64Image: ""
});

const selectedModelName = computed(() => {
  switch(radio.value) {
    case 3: return "随机森林";
    case 6: return "多空间模型";
    case 9: return "多时间模型";
    default: return "";
  }
});

const currentParameters = computed(() => {
  switch(radio.value) {
    case 3:
      return parameterConfig.value.randomForest;
    case 6:
      return parameterConfig.value.multiSpaceModel;
    case 9:
      return parameterConfig.value.multiTimeModel;
    default:
      return {};
  }
});

// 点击按钮的处理函数
const handleClick = (moduleName: string) => {
  selectedButton.value = moduleName;
  showDrawer.value = true;
};

// 关闭抽屉
const closeDrawer = () => {
  showDrawer.value = false;
  value2.value = false;
  inputFile.value = null;
  outputFile.value = null;
  modelPerformance.value = {
      MSE: null,
      R2: null,
      Base64Image: ""
  };
  analysisResultDialogVisible.value = false;
  analysisTableData.value = [];
  analysisImageBase64.value = '';
};

const goToRobotPage = () => {
  router.push('/qa/chat')
}

const goToCoalGangueSortingPage = () => {
  router.push('/qa/chat')
}

// 文件上传处理
const handleInputFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    inputFile.value = file;
  }
};

const handleOutputFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    outputFile.value = file;
  }
};

// 上传输入文件
const uploadInputFile = async () => {
  if (!inputFile.value) {
    ElMessage.error("请选择输入数据集文件");
    return;
  }

  const formData = new FormData();
  formData.append("file", inputFile.value);
  formData.append("file_type", "input"); // 添加文件类型

  try {
    const response = await uploadLocalFile(formData);
    if ("message" in response) {
      ElMessage.success("文件上传成功");
    } else if ("error" in response) {
      ElMessage.error(response.error);
    }
  } catch (error) {
    ElMessage.error("文件上传失败");
  }
};

// 上传输出文件
const uploadOutputFile = async () => {
  if (!outputFile.value) {
    ElMessage.error("请选择输出数据集文件");
    return;
  }

  const formData = new FormData();
  formData.append("file", outputFile.value);
  formData.append("file_type", "output"); // 添加文件类型

  try {
    const response = await uploadLocalFile(formData);
    if ("message" in response) {
      ElMessage.success("文件上传成功");
    } else if ("error" in response) {
      ElMessage.error(response.error);
    }
  } catch (error) {
    ElMessage.error("文件上传失败");
  }
};

// 应用参数
const applyParameters = () => {
  switch (radio.value) {
    case 3: // 随机森林
      paramsToSend = {
        n_estimators: parameterConfig.value.randomForest.decisionTreeCount,
        max_depth: parameterConfig.value.randomForest.maxDepth,
        min_samples_split: parameterConfig.value.randomForest.minSamplesSplit,
        min_samples_leaf: parameterConfig.value.randomForest.minSamplesLeaf
      };
      break;
    case 6: // 多空间模型
      paramsToSend = {
        iterations: parameterConfig.value.multiSpaceModel.iterations,
        historicalData: parameterConfig.value.multiSpaceModel.historicalData,
        predictionData: parameterConfig.value.multiSpaceModel.predictionData,
        nodeCount: parameterConfig.value.multiSpaceModel.nodeCount,
        adjacencyMatrix: parameterConfig.value.multiSpaceModel.adjacencyMatrix
      };
      break;
    case 9: // 多时间模型
      paramsToSend = {
        iterations: parameterConfig.value.multiTimeModel.iterations,
        learningRate: parameterConfig.value.multiTimeModel.learningRate,
        weightDecay: parameterConfig.value.multiTimeModel.weightDecay,
        inputSize: parameterConfig.value.multiTimeModel.inputSize,
        outputSize: parameterConfig.value.multiTimeModel.outputSize
      };
      break;
    default:
      break;
  }
  console.log(paramsToSend);
};

// 重新设置参数
const resetParameters = () => {
  // 根据当前选择的模型类型重置参数
  switch(radio.value) {
    case 3: // 随机森林
      parameterConfig.value.randomForest.decisionTreeCount = 100;
      parameterConfig.value.randomForest.maxDepth = 10;
      parameterConfig.value.randomForest.minSamplesSplit = 2;
      parameterConfig.value.randomForest.minSamplesLeaf = 1;
      break;
    case 6: // 多空间模型
      parameterConfig.value.multiSpaceModel.iterations = 1000;
      parameterConfig.value.multiSpaceModel.historicalData = 10;
      parameterConfig.value.multiSpaceModel.predictionData = 5;
      parameterConfig.value.multiSpaceModel.nodeCount = 50;
      parameterConfig.value.multiSpaceModel.adjacencyMatrix = '';
      break;
    case 9: // 多时间模型
      parameterConfig.value.multiTimeModel.iterations = 500;
      parameterConfig.value.multiTimeModel.learningRate = 0.01;
      parameterConfig.value.multiTimeModel.weightDecay = 0.0001;
      parameterConfig.value.multiTimeModel.inputSize = 128;
      parameterConfig.value.multiTimeModel.outputSize = 64;
      break;
    default:
      break;
  }
  ElMessage.info("参数已重置");
};

// 模型训练
const trainModel = () => {
  if (!inputFile.value || !outputFile.value) {
    ElMessage.error("请先上传输入输出数据集文件");
    return;
  }
  if (selectedButton.value === "") {
    ElMessage.error("请先选择模型类型");
    return;
  }
  switch(radio.value) {
    case 3: // 随机森林
      trainRandomForest();
      break;
    case 6: // 多空间模型
      // TODO: 多空间模型训练
      ElMessage.success(`模型 "${selectedModelName.value}" 训练成功`);
      break;
    case 9: // 多时间模型
      // TODO: 多时间模型训练
      ElMessage.success(`模型 "${selectedModelName.value}" 训练成功`);
      break;
    default:
      break;
  }
};


// 随机森林模型训练
const trainRandomForest = async () => {
  try {
    console.log("开始训练随机森林模型...");
    console.log(inputFile.value.name, outputFile.value.name, selectedButton.value, paramsToSend);
    const response = await onlineTrain_rf(inputFile.value.name, outputFile.value.name, selectedButton.value, paramsToSend);
    if ("message" in response) {
      ElMessage.success(response.message);
      fetchModelList;
    } else if ("error" in response) {
      ElMessage.error(response.error);
    }
  } catch (error) {
    ElMessage.error("模型训练失败");
  }
};

// 模型列表加载
const fetchModelList = async () => {
  try {
    console.log("开始加载模型列表...");
    const response = await getModelList(selectedButton.value);
    if ("error" in response) {
      ElMessage.error(response.error);
      return;
    }
    models.value = response.model_list;
  } catch (error) {
    ElMessage.error(error.message);
  }
};

watch(showDrawer, (newValue) => {
    if (newValue) {
        fetchModelList();
    }
});

// 模型管理方法
const displayModel = async(model: { id: number; name: string }) => {
  if (!inputFile.value || !outputFile.value) {
    ElMessage.error("请先上传输入输出数据集文件");
    return;
  }
  try {
    console.log(inputFile.value.name, outputFile.value.name, selectedButton.value, model.name);
    const response = await modelShow(inputFile.value.name, outputFile.value.name, selectedButton.value, model.name);
    if ("error" in response) {
      ElMessage.error(response.error);
      return;
    }
    modelPerformance.value.MSE = response.mse;
    modelPerformance.value.R2 = response.r2;
    modelPerformance.value.Base64Image = response.image;
    ElMessage.success("模型性能展示成功");
  } catch (error) {
    ElMessage.error(error.message);
  }
};

const explainModel = (model: { id: number; name: string }) => {
  ElMessage.info(`解释模型: ${model.name}`);
};


const deleteModel = async (model: { id: number; name: string }) => {
  ElMessageBox.confirm(`确定要删除模型 "${model.name}" 吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
 .then(async () => {
    // 这里将回调函数标记为 async，使其能正确使用 await
    await deleteMultiLayerModel(model.name);
    ElMessage.success(`模型 "${model.name}" 已删除`);
    fetchModelList();
  })
 .catch(() => {
    ElMessage.info("已取消删除");
  });
};


const downloadModel = async (model: { id: number; name: string } ) => {
  try {
    const response = await downloadMultiLayerModel(model.name);

    // 检查响应类型，确保它是Blob
    if (response instanceof Blob) {
      // 创建一个URL链接指向Blob对象
      const url = window.URL.createObjectURL(response);

      // 创建一个隐藏的链接元素
      const link = document.createElement("a");
      link.href = url;

      // 设置下载的文件名，这里使用传入的 modelName
      link.setAttribute("download", model.name);

      // 将链接元素添加到页面并触发点击
      document.body.appendChild(link);
      link.click();

      // 从页面中移除链接元素
      document.body.removeChild(link);

      // 释放URL对象
      window.URL.revokeObjectURL(url);

      ElMessage.success("下载成功");
    } else {
      // 如果不是Blob，说明是错误对象，打印错误信息
      console.error("不是 blob 类型");
      console.error("Failed to download model:", response.error);
      ElMessage.error(response.error);
    }
  } catch (error) {
    console.error("Failed to download model:", error);
    ElMessage.error("下载失败");
  }
};


const handleShowAnalysisDrawer = async () => {
    if (!inputFile.value ||!outputFile.value) {
        ElMessage.error("请先上传输入输出数据集文件");
        return;
    }
    const data = {
      dataset_input_name: inputFile.value.name,
      dataset_output_name: outputFile.value.name,
    };
    try {
        const response = await grayCorrelationAnalysis(data);
        if ("message" in response && response.message === "Gray correlation analysis completed successfully") {
            // 处理成功返回的结果，将数据赋值给相应的变量用于展示
            const relationResults = response.relation_results;
            const imageBase64 = response.image_base64;
            analysisResultDialogVisible.value = true;
            // 假设你有响应的响应式变量来存储表格数据和图片数据，如下示例
            analysisTableData.value = relationResults;
            analysisImageBase64.value = imageBase64;
        } else if ("error" in response) {
            ElMessage.error(response.error);
        }
    } catch (error) {
        ElMessage.error("关联分析请求失败");
    }
};

// 在挂载时初始化图表并触发数据流
onMounted(async () => {
  try {
    const response = await trigger();
    console.log(response.message);
  } catch (error) {
    console.error("Error triggering data stream:", error);
  }

  nextTick(() => {
    initChart();
  });
});

// 在卸载时关闭WebSocket连接并销毁图表实例
onUnmounted(() => {
  socket.off("update_data");
  socket.close();
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
/* 确保所有元素使用边框盒模型 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 全流程按钮设置 */
.img-hover:hover {
 cursor: pointer;
}

.robot-container {
 position: relative;
 top: 25%;
 left: 28%;
 width: 35px;
 height: 35px;
 background-image: url("../../assets/robot.png");
 background-size: contain;
 background-repeat: no-repeat;
 background-position: center center;
}

.momeiji {
 width: 14%;
 height: 14%;
 position: relative;
 top: 34%;
 left: 38%;
}

.guoluranshao {
 width: 13.5%;
 height: 15%;
 position: relative;
 top: 20%;
 left: 63%;
}

.meifenxuanji {
 width: 6.5%;
 height: 16%;
 position: relative;
 top: 29%;
 left: 25%;
}

.geimeiji {
 width:6.5%;
 height: 16%;
 position: relative;
 top: 13%;
 left: 38%;
}

.geifengji {
 width: 6%;
 height: 15%;
 position: relative;
 top: -2%;
 left: 46.5%;
}

.kongyuqi {
 width: 7%;
 height: 14%;
 position: relative;
 top: -17%;
 left: 62.5%;
}

.jinshuixitong {
 width: 6%;
 height: 14%;
 position: relative;
 top: -31%;
 left: 71%;
}

/* 容器设置 */
.container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  background-color: #64afe9;
  overflow: hidden;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}

/* 左边部分 */
.left-panel {
  flex: 0 0 25%;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin: 10px;
  height: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 右边部分 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 10px;
  height: calc(100% - 20px);
}

/* 右上角部分 */
.right-top {
  flex: 0 0 60%;
  background-color: white;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 右下角部分 */
.right-bottom {
  flex: 1;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.module-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 10px;
}

.section-title {
  font-size: 24px;
  color: #2d7dbc;
  margin-left: 10px;
}

.icon-text-container {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;
}

.chart {
  width: 100%;
  height: calc(100% - 40px);
}

.flow-data-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.flow-item {
  display: flex;
  flex-direction: column;
}

.flow-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.flow-value {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
}

.image-container {
  width: 100%;
  height: 100%;
  background-image: url("../../assets/welcome_picture.jpg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
}

/* 抽屉样式 */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 80%; /* 占据80%的宽度 */
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0,0,0,0.5);
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}

.drawer-content {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
}

.drawer-section {
  box-sizing: border-box;
  width: 48%; /* 调整宽度以适应间距 */
  padding: 20px;
  border: 2px solid #409eff; /* 添加边框 */
  border-radius: 10px; /* 可选：添加圆角 */
  margin: 10px 1%; /* 添加上下左右的间距 */
}

.model-selection label {
  display: block;
  margin-bottom: 10px;
}

.file-upload {
  margin-bottom: 20px; /* 增加每个文件上传块之间的间隙 */
}

.file-input-container {
  display: flex;
  gap: 10px; /* 设置元素之间的间隙 */
  align-items: center; /* 垂直居中 */
}

.file-input {
  padding: 10px; /* 内边距 */
  font-size: 16px; /* 字体大小 */
  border: 2px solid #ccc; /* 边框 */
  border-radius: 5px; /* 圆角 */
}

.file-upload button {
  padding: 10px 20px; /* 内边距 */
  font-size: 16px; /* 字体大小 */
  color: white; /* 白色文字 */
  cursor: pointer; /* 鼠标悬停时显示为手型 */
  background-color: #409eff; /* 蓝色背景 */
  border: none; /* 无边框 */
  border-radius: 5px; /* 圆角 */
  transition: background-color 0.3s ease; /* 背景颜色过渡效果 */
}

.file-upload button:hover {
  background-color: #79bbff; /* 悬停时背景颜色变深 */
}

.section-title {
  margin-bottom: 10px;
  font-size: 24px;
  color: #2d7dbc;
}

.icon-text-container {
  display: flex;
  gap: 10px; /* 设置图标和文本之间的间隙 */
  align-items: center; /* 垂直居中 */
}

.analysis-section {
  /* margin-top: 20px; */
  margin-bottom: 20px;
}

.analysis-btn {
  margin-right: 40px;
}

.switch-container {
  display: flex;
  align-items: center;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.model-selection-form .el-form-item {
  display: flex;
  align-items: center;
  font-size: large;
}

.radio-group {
  margin-left: 10px; /* 根据需要调整间距 */
}

.parameter-config-form {
  max-width: 600px;
  margin: 20px auto;
}

.parameter-config-form .el-form-item {
  margin-bottom: 20px;
}

.parameter-config-form .el-button {
  min-width: 100px;
}

.parameter-config,
.model-management,
.model-display {
  margin-top: 10px;
}

/* 调整模型管理表格的样式 */
.model-management {
  margin-top: 20px;
}

.el-table .el-button {
  margin-right: 5px;
}

.el-table .el-button:last-child {
  margin-right: 0;
}

/* 新增的模型展示样式 */
.model-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.performance-metrics {
  display: flex;
  flex-direction: row; /* 水平排列 */
  gap: 20px; /* 可选：设置项目之间的间距 */
  align-items: center; /* 垂直居中对齐 */
  margin-bottom: 20px;
  font-size: 18px;
}

.chart-placeholder {
  /* width: 100%; */
  width: 600px;
  height: 280px;
  /* max-width: 600px; */
  /* max-height: 280px; */
  position: relative;
}

.placeholder {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #aaa;
  font-size: 20px;
  border-radius: 10px; /* 可选：添加圆角 */
}

.chart-placeholder img {
  width: auto;
  height: 100%;
  object-fit: cover;
  border-radius: 10px; /* 可选：添加圆角 */
}

/* 整体分析结果容器样式 */
.analysis-result-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
}

/* 分析表格容器样式 */
.analysis-table-container {
    flex: 0 0 30%;  /* 表格宽度占弹窗的三分之一 */
    height: 400px;  /* 固定表格高度，可根据实际情况调整 */
    overflow-y: auto;  /* 当表格内容超出高度时出现滚动条 */
    margin-right: 10px;  /* 表格与图片之间的间距 */
}

/* 分析图片容器样式 */
.analysis-image-container {
    flex: 0 0 65%;  /* 图片宽度占弹窗的三分之二左右 */
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 图片样式（可选，可进一步调整图片展示效果） */
.analysis-image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

/* 暂无图片时的占位样式 */
.analysis-image-container.placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    color: #999;
}
</style>

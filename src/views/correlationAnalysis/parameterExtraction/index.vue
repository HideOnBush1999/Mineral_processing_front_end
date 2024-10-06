<template>
  <div class="container">
    <!-- 左侧部分 -->
    <div class="left">
      <!-- 数据导入部分 -->
      <div class="data-import">
        <h1 style="font-size: 30px">关键参数提取</h1>
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc"
            ><FolderAdd
          /></el-icon>
          <span class="section-title">数据导入</span>
        </div>
        <div class="file-upload">
          <div class="file-input-container">
            <p style="margin: 0; font-weight: bolder">请选择输入数据集</p>
            <input
              type="file"
              class="file-input"
              @change="handleInputFileUpload"
            />
            <button @click="uploadInputFile">点击上传</button>
          </div>
        </div>
        <div class="file-upload">
          <div class="file-input-container">
            <p style="margin: 0; font-weight: bolder">请选择输出数据集</p>
            <input
              type="file"
              class="file-input"
              @change="handleOutputFileUpload"
            />
            <button @click="uploadOutputFile">点击上传</button>
          </div>
        </div>
      </div>
      <!-- 数据展示和建立随机森林模型部分 -->
      <div class="left-bottom">
        <div class="data-display-section">
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc"
              ><Loading
            /></el-icon>
            <span class="section-title">数据展示</span>
          </div>
          <button class="button-style" @click="showInputFileInfo">
            显示输入数据集
          </button>
          <div v-if="inputFileInfo">
            <p>
              列数: {{ inputFileInfo.columnCount }} 数据条数:
              {{ inputFileInfo.dataCount }}
            </p>
          </div>

          <div class="table-container" v-if="inputFileInfo">
            <el-table
              :data="inputFileInfo.columns.map(column => ({ name: column }))"
              style="width: 100%"
            >
              <el-table-column prop="name" label="列名" />
            </el-table>
          </div>

          <button
            class="button-style"
            @click="showOutputFileInfo"
            style="margin-top: 20px"
          >
            显示输出数据集
          </button>
          <div v-if="outputFileInfo">
            <p>
              列数: {{ outputFileInfo.columnCount }} 数据条数:
              {{ outputFileInfo.dataCount }}
            </p>
          </div>
          <div class="table-container" v-if="outputFileInfo">
            <el-table
              :data="outputFileInfo.columns.map(column => ({ name: column }))"
              style="width: 100%"
            >
              <el-table-column prop="name" label="列名" />
            </el-table>
          </div>
        </div>
        <div class="random-forest-model-section">
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc"
              ><Connection
            /></el-icon>
            <div class="section-title">建立随机森林模型</div>
          </div>

          <div class="parameter-input" style="margin-bottom: 20px">
            <div><p>决策树数量</p></div>
            <el-input-number
              v-model="nEstimators"
              :min="10"
              :max="1000"
              label="n_estimators"
              id="n_estimators"
            />
            <el-button type="primary" @click="trainModel">在线训练</el-button>
          </div>

          <div class="model-selection">
            <div class="icon-text-container">
              <span>选择模型</span>
              <el-button type="primary" @click="confirmModelSelection"
                >确认</el-button
              >
              <el-button type="primary" @click="showModelPerformance"
                >模型性能展示</el-button
              >
            </div>
            <el-table
              :data="models"
              style="width: 100%; margin-top: 10px"
              @row-click="handleSelectionChange"
              height="200px"
            >
              <!-- <el-table-column type="index" width="50"></el-table-column> -->
              <el-table-column prop="name" label="模型名称">
                <template #default="scope">
                  <el-radio :label="scope.row.name" v-model="selectedModel" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧部分 -->
    <div class="right">
      <div class="model-display">
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc"
            ><SetUp
          /></el-icon>
          <div class="section-title">模型性能分析结果</div>
        </div>
        <div>
          <table
            style="
              width: 100%;
              margin-bottom: 20px;
              text-align: left;
              border-collapse: collapse;
            "
          >
            <tr style="border-bottom: 1px solid #ccc">
              <th style="padding: 8px">MSE</th>
              <th style="padding: 8px">R²</th>
            </tr>
            <tr>
              <td style="padding: 8px">{{ mse !== null ? mse : "..." }}</td>
              <td style="padding: 8px">{{ r2 !== null ? r2 : "..." }}</td>
            </tr>
          </table>
          <div
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 500px;
              height: 250px;
              margin: 0 auto;
              background-color: #f0f0f0;
            "
          >
            <img
              v-if="modelImage"
              :src="'data:image/png;base64,' + modelImage"
              alt="Model Performance Image"
              style="width: 100%; height: 100%"
            />
            <span v-else />
          </div>
        </div>
      </div>

      <div class="algorithm-selection">
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc"
            ><DataAnalysis
          /></el-icon>
          <div class="section-title">关键工艺参数算法选取</div>
        </div>

        <div class="algorithm-input">
          <label for="algorithm">请选择模型：</label>
          <select id="algorithm" v-model="selectedAlgorithm">
            <option value="内置特征重要性">内置特征重要性</option>
            <option value="排列特征重要性">排列特征重要性函数</option>
          </select>
          <el-button type="primary" @click="handleAlgorithmSelection"
            >确定</el-button
          >
        </div>
        <div class="table-container-result">
          <el-table
            :data="importanceData"
            style="width: 100%; max-height: 200px; overflow-y: auto"
          >
            <el-table-column prop="name" label="属性名" />
            <el-table-column prop="value" label="数值" />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  uploadLocalFile,
  getFileInfo,
  trainRandomForest,
  listModels,
  downloadModel,
  getFeatureImportance,
  getPermutationImportance,
  evaluateModel
} from "@/api/correlation";
import { ElMessage, ElTable, ElTableColumn } from "element-plus";

const inputFile = ref<File | null>(null);
const outputFile = ref<File | null>(null);
const nEstimators = ref(100);
const models = ref<{ name: string }[]>([]);
const selectedModel = ref<string | null>(null);
const mse = ref<number | null>(null);
const r2 = ref<number | null>(null);
const modelImage = ref<string | null>(null);

// 添加响应式变量
const selectedAlgorithm = ref("内置特征重要性");
const importanceData = ref<{ name: string; value: number }[]>([]);

const inputFileInfo = ref<{
  columnCount: number;
  columns: string[];
  dataCount: number;
} | null>({ columnCount: 0, columns: [], dataCount: 0 });

const outputFileInfo = ref<{
  columnCount: number;
  columns: string[];
  dataCount: number;
} | null>({ columnCount: 0, columns: [], dataCount: 0 });

const handleInputFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    inputFile.value = target.files[0];
  }
};

const handleOutputFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    outputFile.value = target.files[0];
  }
};

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

const showFileInfo = async (
  filename: string,
  setFileInfo: (info: any) => void
) => {
  try {
    const response = await getFileInfo(filename);
    if ("error" in response) {
      ElMessage.error(response.error);
    } else {
      setFileInfo({
        columnCount: response.column_count,
        columns: response.column_names,
        dataCount: response.data_count
      });
    }
  } catch (error) {
    ElMessage.error("获取文件信息失败");
  }
};

const showInputFileInfo = () => {
  if (!inputFile.value) {
    ElMessage.error("请先上传输入数据集文件");
    return;
  }
  showFileInfo(inputFile.value.name, info => {
    inputFileInfo.value = info;
    console.log(inputFileInfo.value);
  });
};

const showOutputFileInfo = () => {
  if (!outputFile.value) {
    ElMessage.error("请先上传输出数据集文件");
    return;
  }
  showFileInfo(outputFile.value.name, info => {
    outputFileInfo.value = info;
  });
};

const trainModel = async () => {
  try {
    const response = await trainRandomForest({
      input_file: inputFile.value?.name || "",
      output_file: outputFile.value?.name || "",
      n_estimators: nEstimators.value
    });
    if ("message" in response) {
      ElMessage.success(response.message);
      loadModels(); // 训练成功后加载模型列表
    } else if ("error" in response) {
      ElMessage.error(response.error);
    }
  } catch (error) {
    ElMessage.error("模型训练失败");
  }
};

const loadModels = async () => {
  try {
    const response = await listModels();
    if ("message" in response) {
      models.value = response.objects.map((obj: string) => ({ name: obj }));
    } else if ("error" in response) {
      ElMessage.error(response.error);
    }
  } catch (error) {
    ElMessage.error("获取模型列表失败");
  }
};

const confirmModelSelection = async () => {
  if (!selectedModel.value) {
    ElMessage.error("请先选择模型");
    return;
  }
  try {
    const response = await downloadModel({
      model_name: selectedModel.value
    });
    if ("message" in response) {
      ElMessage.success(response.message);
    } else if ("error" in response) {
      ElMessage.error(response.error);
    }
  } catch (error) {
    ElMessage.error("下载模型失败");
  }
};

const handleSelectionChange = (selection: { name: string }) => {
  selectedModel.value = selection.name;
  console.log(selectedModel.value);
};

const showModelPerformance = async () => {
  if (!selectedModel.value) {
    ElMessage.error("请先选择模型");
    return;
  }

  // 重置性能数据
  mse.value = null;
  r2.value = null;
  modelImage.value = null;

  const data = {
    model_name: selectedModel.value,
    input_file: inputFile.value?.name || "",
    output_file: outputFile.value?.name || ""
  };

  try {
    const response = await evaluateModel(data);
    if ("mse" in response && "r2" in response && "image" in response) {
      mse.value = response.mse;
      r2.value = response.r2;
      modelImage.value = response.image;
    } else if ("error" in response) {
      ElMessage.error(response.error);
    }
  } catch (error) {
    ElMessage.error("获取模型性能分析结果失败");
  }
};

const handleAlgorithmSelection = async () => {
  if (!selectedModel.value) {
    ElMessage.error("请先选择模型");
    return;
  }

  const data = {
    model_name: selectedModel.value,
    input_file: inputFile.value?.name || "",
    output_file: outputFile.value?.name || "",
    number_key_parameters: 10 // TODO: 后续可增加参数设置
  };

  try {
    let response;
    if (selectedAlgorithm.value === "内置特征重要性") {
      response = await getFeatureImportance(data);
    } else if (selectedAlgorithm.value === "排列特征重要性") {
      response = await getPermutationImportance(data);
    }

    if (response && "error" in response) {
      ElMessage.error(response.error);
    } else if (response && "message" in response) {
      ElMessage.success(response.message);
      const importanceDict =
        response.feature_importance_dict ||
        response.permutation_importance_dict;
      importanceData.value = Object.entries(importanceDict).map(
        ([name, value]) => ({ name, value: value as number })
      );
    }
  } catch (error) {
    ElMessage.error("获取特征重要性失败");
  }
};

onMounted(loadModels);
</script>

<style scoped>
.container {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 80vh;
  padding: 20px;
  overflow: hidden; /* Ensure content stays within one page */
  background-color: #64afe9;
}

.left {
  display: flex;
  flex-direction: column;
  width: 50%;
  margin-right: 20px;
}

.data-import {
  box-sizing: border-box;
  padding: 20px;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
}

.icon-text-container {
  display: flex;
  gap: 10px; /* 设置图标和文本之间的间隙 */
  align-items: center; /* 垂直居中 */
}

.left-bottom {
  display: flex;
  flex: 1;
}

.data-display-section,
.random-forest-model-section {
  box-sizing: border-box;
  flex: 1;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
}

.data-display-section {
  margin-right: 20px;
}

.right {
  display: flex;
  flex-direction: column;
  width: 50%;
}

.section-title {
  margin-bottom: 10px;
  font-size: 24px;
  color: #2d7dbc;
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

.model-display,
.algorithm-selection {
  box-sizing: border-box;
  padding: 10px; /* Reduced padding */
  margin-bottom: 20px; /* Reduced margin */
  background-color: white;
  border-radius: 8px;
}

.parameter-input,
.algorithm-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.parameter-input input,
.algorithm-input select {
  margin-left: 10px;
}

.data-display {
  height: 200px;
  border: 1px solid #ccc;
}

.table-container {
  height: 100px;
  max-height: 100px;
  overflow-y: auto; /* 纵向滚动条 */
}

.column-item {
  padding: 10px;
  font-size: 16px;
  border-bottom: 1px solid #ccc;
}

.button-style {
  padding: 5px; /* 内边距 */
  font-size: 12px; /* 字体大小 */
  color: white; /* 白色文字 */
  cursor: pointer; /* 鼠标悬停时显示为手型 */
  background-color: #409eff; /* 蓝色背景 */
  border: none; /* 无边框 */
  border-radius: 5px; /* 圆角 */
  transition: background-color 0.3s ease; /* 背景颜色过渡效果 */
}

.button-style:hover {
  background-color: #79bbff; /* 悬停时背景颜色变深 */
}

.model-selection {
  max-height: 300px; /* 设置最大高度 */
  overflow-y: auto; /* 超出时添加滚动条 */
}

.table-container-result {
  height: 180px; /* 固定表格高度 */
  padding: 10px;
  overflow-y: auto; /* 超出时添加滚动条 */
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>

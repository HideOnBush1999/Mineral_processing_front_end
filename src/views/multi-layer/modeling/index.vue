<template>
  <div class="container">
    <div class="top-container">
      <!-- 左上部分 -->
      <div class="module left-top">
        <h1 style="font-size: 30px">多层模型建立</h1>
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
            <FolderAdd />
          </el-icon>
          <span class="section-title">数据导入</span>
        </div>

        <div class="file-upload">
          <div class="file-input-container">
            <p style="margin: 0; font-weight: bolder">请选择磨煤数据集</p>
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
            <p style="margin: 0; font-weight: bolder">请选择锅炉数据集</p>
            <input
              type="file"
              class="file-input"
              @change="handleOutputFileUpload"
            />
            <button @click="uploadOutputFile">点击上传</button>
          </div>
        </div>
      </div>

      <!-- 右上部分 -->
      <div class="module right-top">
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
            <Ship />
          </el-icon>
          <span class="section-title">多层模型框架</span>
        </div>
        <img
          src="@/assets/multi-layer_framework.png"
          alt="multi-layer_framework image"
        />
      </div>
    </div>

    <!-- 底层部分 -->
    <div class="module bottom">
      <div class="icon-text-container">
        <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
          <Trophy />
        </el-icon>
        <span class="section-title">多层模型配置</span>
      </div>

      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ccc">模块</th>
            <th style="padding: 8px; border: 1px solid #ccc">决策树数量</th>
            <th style="padding: 8px; border: 1px solid #ccc">在线训练</th>
            <th style="padding: 8px; border: 1px solid #ccc">模型选择</th>
            <th style="padding: 8px; border: 1px solid #ccc">模型展示</th>
            <th style="padding: 8px; border: 1px solid #ccc">优化求解</th>
            <th style="padding: 8px; border: 1px solid #ccc">求解结果</th>
          </tr>
        </thead>
        <tbody style="text-align: center">
          <tr v-for="module in modules" :key="module.name">
            <td style="padding: 8px; border: 1px solid #ccc">
              {{ module.name }}
            </td>
            <td style="padding: 8px; border: 1px solid #ccc">
              <el-input-number
                v-model="module.nEstimators"
                :min="10"
                :max="1000"
                label="n_estimators"
                id="n_estimators"
              />
            </td>
            <td style="padding: 8px; border: 1px solid #ccc">
              <el-button type="primary" @click="trainModel(module)"
                >在线训练</el-button
              >
            </td>
            <td style="padding: 8px; border: 1px solid #ccc">
              <el-select
                v-model="module.selectedModel"
                placeholder="请选择模型"
              >
                <el-option
                  v-for="model in module.models"
                  :key="model"
                  :label="model"
                  :value="model"
                />
              </el-select>
            </td>
            <td style="padding: 8px; border: 1px solid #ccc">
              <el-button type="primary" @click="showModel(module)"
                >模型展示</el-button
              >
            </td>
            <td style="padding: 8px; border: 1px solid #ccc">
              <el-button type="primary" @click="optimizeModel(module)"
                >优化求解</el-button
              >
            </td>
            <td style="padding: 8px; border: 1px solid #ccc">
              <el-button type="primary" @click="getOptimizaResult(module)"
                >求解结果</el-button
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 模型展示结果弹窗 -->
    <el-dialog v-model="showModelDialog" title="模型展示结果" width="30%">
      <div class="dialog-content">
        <div class="result-item">
          <span class="result-label">MSE:</span>
          <span class="result-value">{{ modelResult.mse }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">R2:</span>
          <span class="result-value">{{ modelResult.r2 }}</span>
        </div>
      </div>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showModelDialog = false"
            >关闭</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- 优化求解结果弹窗 -->
    <el-dialog
      v-model="showOptimizationDialog"
      title="优化求解结果"
      width="30%"
    >
      <div v-if="optimizationResult.state === 'SUCCESS'" class="dialog-content">
        <ul class="result-list">
          <li
            v-for="(value, key) in optimizationResult.result.optimal_inputs"
            :key="key"
            class="result-item"
          >
            <span class="result-key">{{ key }}:</span>
            <span class="result-value">{{ value }}</span>
          </li>
        </ul>
      </div>
      <div v-else class="dialog-content">
        <p>状态: {{ optimizationResult.status }}</p>
      </div>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showOptimizationDialog = false"
            >关闭</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElDialog } from "element-plus";
import {
  fileUploadInput,
  onlineTrain,
  modelShow,
  getModelList,
  optimizationSolve,
  getOptimizationResult
} from "@/api/multi-layer";

const selectedInputFile = ref(null);
const selectedOutputFile = ref(null);

const modules = ref([
  {
    name: "给煤机",
    nEstimators: 100,
    models: [],
    selectedModel: "",
    datasetName: "",
    task_id: ""
  },
  {
    name: "给风机",
    nEstimators: 100,
    models: [],
    selectedModel: "",
    datasetName: "",
    task_id: ""
  },
  {
    name: "磨煤",
    nEstimators: 100,
    models: [],
    selectedModel: "",
    datasetName: "",
    task_id: ""
  },
  {
    name: "锅炉进口空预器",
    nEstimators: 100,
    models: [],
    selectedModel: "",
    datasetName: "",
    task_id: ""
  },
  {
    name: "给水系统",
    nEstimators: 100,
    models: [],
    selectedModel: "",
    datasetName: "",
    task_id: ""
  },
  {
    name: "锅炉燃烧",
    nEstimators: 100,
    models: [],
    selectedModel: "",
    datasetName: "",
    task_id: ""
  }
]);

const showModelDialog = ref(false);
const modelResult = ref({ mse: 0, r2: 0 });

const showOptimizationDialog = ref(false);
const optimizationResult = ref({ state: "", status: "", result: "" });

const handleInputFileUpload = event => {
  selectedInputFile.value = event.target.files[0];
};

const handleOutputFileUpload = event => {
  selectedOutputFile.value = event.target.files[0];
};

const uploadInputFile = async () => {
  if (selectedInputFile.value) {
    const formData = new FormData();
    formData.append("file", selectedInputFile.value);
    try {
      const response = await fileUploadInput(formData);
      ElMessage.success(response.message);

      // Update datasetName for modules that use input file
      modules.value.forEach(module => {
        if (
          module.name === "给煤机" ||
          module.name === "给风机" ||
          module.name === "磨煤"
        ) {
          module.datasetName = selectedInputFile.value.name;
        }
      });
    } catch (error) {
      ElMessage.error(error.message);
    }
  } else {
    ElMessage.warning("请选择一个文件进行上传");
  }
};

const uploadOutputFile = async () => {
  if (selectedOutputFile.value) {
    const formData = new FormData();
    formData.append("file", selectedOutputFile.value);
    try {
      const response = await fileUploadInput(formData);
      ElMessage.success(response.message);

      // Update datasetName for modules that use output file
      modules.value.forEach(module => {
        if (
          module.name === "锅炉进口空预器" ||
          module.name === "给水系统" ||
          module.name === "锅炉燃烧"
        ) {
          module.datasetName = selectedOutputFile.value.name;
        }
      });
    } catch (error) {
      ElMessage.error(error.message);
    }
  } else {
    ElMessage.warning("请选择一个文件进行上传");
  }
};

const fetchModelList = async module => {
  try {
    const response = await getModelList(module.name);
    module.models = response.model_list;
    module.selectedModel = module.models.length > 0 ? module.models[0] : "";
  } catch (error) {
    ElMessage.error(error.message);
  }
};

// Fetch models for all modules on mount
onMounted(() => {
  modules.value.forEach(module => {
    fetchModelList(module);
  });
});

const trainModel = async module => {
  try {
    if (module.datasetName === "") {
      ElMessage.warning("请先上传数据集");
      return;
    }
    ElMessage.info("开始训练模型，请稍后...");
    console.log(module.datasetName);
    console.log(module.name);
    console.log(module.nEstimators);
    const response = await onlineTrain(
      module.datasetName,
      module.name,
      module.nEstimators
    );
    ElMessage.success(response.message);

    // 更新模型列表
    await fetchModelList(module);
  } catch (error) {
    ElMessage.error(error.message);
  }
};

const showModel = async module => {
  try {
    console.log(module.datasetName);
    console.log(module.name);
    console.log(module.selectedModel);
    if (module.datasetName === "") {
      ElMessage.warning("请先上传数据集");
      return;
    }
    const response = await modelShow(
      module.datasetName,
      module.name,
      module.selectedModel
    );
    modelResult.value.mse = response.mse;
    modelResult.value.r2 = response.r2;
    console.log(modelResult.value);
    showModelDialog.value = true;
    console.log(showModelDialog.value);
  } catch (error) {
    ElMessage.error(error.message);
  }
};

const optimizeModel = async module => {
  try {
    if (module.datasetName === "") {
      ElMessage.warning("请先上传数据集");
      return;
    }
    ElMessage.info("开始优化求解，请稍后...");
    console.log(module.datasetName);
    console.log(module.name);
    console.log(module.selectedModel);
    const response = await optimizationSolve(
      module.datasetName,
      module.name,
      module.selectedModel
    );
    ElMessage.success(`Task ID: ${response.task_id}`);
    module.task_id = response.task_id;
  } catch (error) {
    ElMessage.error(error.message);
  }
};

const getOptimizaResult = async module => {
  try {
    if (module.task_id === "") {
      ElMessage.warning("请先优化求解模型");
      return;
    }
    const response = await getOptimizationResult(module.task_id);
    optimizationResult.value.state = response.state;
    optimizationResult.value.status = response.status;
    optimizationResult.value.result = response.result || "";
    showOptimizationDialog.value = true;
  } catch (error) {
    ElMessage.error(error.message);
  }
};
</script>

<style scoped>
.container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 80vh;
  padding: 20px; /* 内边距  内容和边框之间的空间 */
  overflow: hidden; /* Ensure content stays within one page */
  background-color: #2d7dbc;
}

.top-container {
  display: flex;
  gap: 2%; /* 间隔 */
  width: 100%;
  height: 38%;
}

.module {
  background-color: white;
  border-radius: 8px; /* 可选，增加圆角 */
}

.left-top {
  width: 42%;
  height: 100%;
  padding: 20px; /* 内边距 */
}

.right-top {
  box-sizing: border-box; /* 确保内边距不会影响总宽度 */
  width: 56%;
  height: 100%;
  padding: 20px; /* 内边距 */
  overflow: hidden; /* 隐藏溢出内容 */
}

.right-top img {
  display: block; /* 去除默认的img元素底部的间距 */
  max-width: 100%;
  max-height: 90%;
  margin: auto; /* 居中对齐 */
  object-fit: contain; /* 保持图片的纵横比 */
}

.bottom {
  width: 100%;
  height: 58%;
  padding: 20px; /* 内边距 */
  margin-top: 20px; /* 间隔 */
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

.file-upload {
  margin-bottom: 15px; /* 增加每个文件上传块之间的间隙 */
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
  padding: 5px 20px; /* 内边距 */
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

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  font-size: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.result-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.result-label {
  margin-right: 10px;
  font-weight: bold;
}

.result-value {
  color: #2d7dbc;
}

.result-list {
  width: 100%;
  padding: 0;
  list-style-type: none;
}

.result-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.result-key {
  font-weight: bold;
}

.dialog-footer {
  right: 10px;
  bottom: 10px;
  width: calc(100% - 20px); /* Adjust the width to account for padding */
  padding: 10px 20px;
  margin-top: 10px;
  text-align: right;
}
</style>

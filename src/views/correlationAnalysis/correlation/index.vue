<template>
  <div class="container">
    <!-- 左侧部分 -->
    <div class="left">
      <!-- 数据导入部分 -->
      <div class="data-import">
        <h1 style="font-size: 30px">关联度分析</h1>
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
            <FolderAdd />
          </el-icon>
          <span class="section-title">数据导入</span>
        </div>
        <div class="upload-section">
          <input type="file" @change="handleFileChange" />
          <el-button @click="uploadFile" size="large" type="primary"
            >上传文件</el-button
          >
        </div>
        <el-select v-model="selectedFile" placeholder="选择已有文件">
          <el-option
            v-for="item in fileList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <el-button
          @click="useSelectedFile"
          size="large"
          type="primary"
          style="margin-left: 70px"
          >使用选中文件</el-button
        >
      </div>
      <!-- 关联分析表格展示部分 -->
      <div class="data-display">
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
            <DataLine />
          </el-icon>
          <span class="section-title">表格展示</span>
        </div>
        <el-table
          :data="tableData"
          style="width: 100%; height: 100%; max-height: 300px; overflow-y: auto"
        >
          <el-table-column prop="Feature" label="特征" />
          <el-table-column prop="RelationDegree" label="关联度" />
        </el-table>
        <div class="button-container">
          <el-button @click="generateTable" size="large" type="primary"
            >生成表格结果</el-button
          >
        </div>
      </div>
    </div>

    <!-- 右侧部分 -->
    <div class="right">
      <!-- 灰度关联图展示部分 -->
      <div class="model-display">
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
            <Histogram />
          </el-icon>
          <div class="section-title">灰度关联图展示</div>
        </div>
        <div class="image-container">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="灰度关联图"
            class="gray-image"
          />
        </div>
        <div class="button-container">
          <el-button @click="generateImage" size="large" type="primary"
            >生成图片结果</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  uploadExcel,
  listExcel,
  downloadExcel,
  grayCorrelationAnalysis,
  generateImageApi
} from "@/api/correlation";
import { ElMessage } from "element-plus";

const fileList = ref<string[]>([]);
const selectedFile = ref<string | null>(null);
const tableData = ref<{ Feature: string; RelationDegree: number }[]>([]);
const imageUrl = ref<string | null>(null);
const selectedLocalFile = ref<File | null>(null);

const fetchFileList = async () => {
  try {
    const response = await listExcel();
    if ("object_list" in response) {
      fileList.value = response.object_list;
    } else {
      console.error(response.error);
      ElMessage.error("获取文件列表时出错");
    }
  } catch (error) {
    console.error("获取文件列表时出错:", error);
    ElMessage.error("获取文件列表时出错");
  }
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedLocalFile.value = input.files[0];
  }
};

const uploadFile = async () => {
  if (selectedLocalFile.value) {
    const formData = new FormData();
    formData.append("file", selectedLocalFile.value);
    try {
      const response = await uploadExcel(formData);
      if ("file_path" in response) {
        fetchFileList(); // 刷新文件列表
        ElMessage.success("文件上传成功");
      } else {
        console.error(response.error);
        ElMessage.error("文件上传时出错");
      }
    } catch (error) {
      console.error("文件上传时出错:", error);
      ElMessage.error("文件上传时出错");
    }
  }
};

const useSelectedFile = async () => {
  if (selectedFile.value) {
    try {
      const response = await downloadExcel({ excel_name: selectedFile.value });
      if ("download_path" in response) {
        console.log("已选择文件:", response.download_path);
      } else {
        console.error(response.error);
        ElMessage.error("使用选择的文件时出错");
      }
    } catch (error) {
      console.error("使用选择的文件时出错:", error);
      ElMessage.error("使用选择的文件时出错");
    }
  }
};

const generateTable = async () => {
  if (selectedFile.value) {
    try {
      const response = await grayCorrelationAnalysis({
        file: selectedFile.value
      });
      if ("relation_results" in response) {
        tableData.value = response.relation_results;
      } else {
        console.error(response.error);
        ElMessage.error("生成表格时出错");
      }
    } catch (error) {
      console.error("生成表格时出错:", error);
      ElMessage.error("生成表格时出错");
    }
  } else {
    ElMessage.error("请先选择一个文件");
  }
};

const generateImage = async () => {
  try {
    const response = await generateImageApi({
      relation_results: tableData.value
    });
    if (response instanceof Blob) {
      imageUrl.value = URL.createObjectURL(response);
    }
  } catch (error) {
    console.error("生成图片时出错:", error);
    ElMessage.error("生成图片时出错");
  }
};

onMounted(() => {
  fetchFileList();
});
</script>

<style scoped>
.container {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 80vh;
  padding: 20px;
  overflow: hidden; /* Ensure content stays within one page */
  background-color: #2d7dbc;
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

.upload-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.icon-text-container {
  display: flex;
  gap: 10px; /* 设置图标和文本之间的间隙 */
  align-items: center; /* 垂直居中 */
}

.data-display {
  box-sizing: border-box;
  flex: 1;
  padding: 20px;
  overflow-y: auto; /* Enable vertical scrolling */
  background-color: white;
  border-radius: 8px;
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

.model-display {
  box-sizing: border-box;
  height: 100%;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px; /* Fixed height for the image container */
  margin-top: 5%;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%); /* Add shadow to the image container */
}

.gray-image {
  max-width: 100%;
  max-height: 100%;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>

<template>
  <div class="container">
    <div class="title">
      <el-icon style="font-size: 30px"><Setting /></el-icon>
      <h1>模型管理</h1>
    </div>
    <div class="search-container">
      <el-input
        v-model="keyword"
        placeholder="输入关键词搜索"
        @input="searchModels"
        clearable
        class="search-input"
        style="width: 300px"
      />
      <el-button @click="searchModels" type="primary">搜索</el-button>
      <el-button @click="openAddDialog" type="success">新增</el-button>
    </div>
    <el-table :data="models" style="width: 100%" stripe>
      <el-table-column prop="name" label="模型名称">
        <template #default="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="scope.row.name"
            placement="top"
          >
            <span class="ellipsis">{{ scope.row.name }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="模型大小">
        <template #default="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="scope.row.size"
            placement="top"
          >
            <span class="ellipsis">{{ scope.row.size }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <template v-if="scope.row.name">
            <el-button
              @click="openUpdateDialog(scope.row)"
              type="primary"
              size="small"
              >修改</el-button
            >
            <el-button
              @click="confirmDelete(scope.row)"
              type="danger"
              size="small"
              >删除</el-button
            >
            <el-button
              @click="downloadModel(scope.row.name)"
              type="default"
              size="small"
              >下载</el-button
            >
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        @current-change="handlePageChange"
        :current-page="page"
        :page-size="limit"
        layout="prev, pager, next"
        :total="total"
      />
      <div class="jump-to-page">
        <el-input
          v-model="goToPage"
          placeholder="跳转到页"
          type="number"
          style="width: 100px; margin-left: 10px"
          @keyup.enter="goToPageNumber"
        />
        <el-button @click="goToPageNumber">跳转</el-button>
      </div>
    </div>
    <!-- 删除确认对话框 -->
    <el-dialog
      title="确认删除"
      v-model="deleteDialogVisible"
      width="30%"
      @close="resetDeleteDialog"
    >
      <span>确认要删除这个模型吗？</span>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteModelConfirm">确认</el-button>
      </template>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      title="修改模型"
      v-model="updateDialogVisible"
      width="50%"
      @close="resetUpdateDialog"
    >
      <el-form :model="updateForm">
        <el-form-item label="模型名称" :label-width="formLabelWidth">
          <el-input v-model="updateForm.new_name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateModelConfirm">确认</el-button>
      </template>
    </el-dialog>
    <!-- 新增对话框 -->
    <el-dialog
      title="新增模型"
      v-model="addDialogVisible"
      width="50%"
      @close="resetAddDialog"
    >
      <el-form :model="addForm">
        <el-form-item label="模型文件" :label-width="formLabelWidth">
          <input type="file" @change="handleFileUpload" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addModelConfirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import {
  getMultiLayerModels,
  searchMultiLayerModel,
  updateMultiLayerModel,
  deleteMultiLayerModel,
  addMultiLayerModel,
  downloadMultiLayerModel
} from "@/api/multi-layer";
import { ElMessage } from "element-plus";

export default {
  setup() {
    const models = ref([]);
    const page = ref(1);
    const limit = ref(10);
    const keyword = ref("");
    const total = ref(0);
    const goToPage = ref(null);

    const deleteDialogVisible = ref(false);
    const updateDialogVisible = ref(false);
    const addDialogVisible = ref(false);

    const deleteForm = ref({});
    const updateForm = ref({
      old_name: "",
      new_name: ""
    });
    const addForm = ref({
      file: null
    });

    const formLabelWidth = "80px";

    const fetchModels = async () => {
      try {
        const response = await getMultiLayerModels(page.value, limit.value);
        models.value = response.models;
        total.value = response.total;
        goToPage.value = null;
      } catch (error) {
        console.error("Failed to fetch models:", error);
        ElMessage.error("获取模型失败");
      }
    };

    const searchModels = async () => {
      try {
        if (keyword.value) {
          const response = await searchMultiLayerModel(keyword.value);
          models.value = response.models;
          total.value = response.total;
        } else {
          fetchModels();
        }
      } catch (error) {
        console.error("Failed to search models:", error);
        ElMessage.error("搜索模型失败");
      }
    };

    const handlePageChange = newPage => {
      page.value = newPage;
      fetchModels();
    };

    const goToPageNumber = () => {
      const pageNumber = parseInt(goToPage.value, 10);
      if (
        pageNumber &&
        pageNumber > 0 &&
        pageNumber <= Math.ceil(total.value / limit.value)
      ) {
        page.value = pageNumber;
        fetchModels();
      } else {
        ElMessage.error("页码超出范围");
      }
    };

    const confirmDelete = row => {
      deleteForm.value = { ...row };
      deleteDialogVisible.value = true;
    };

    const deleteModelConfirm = async () => {
      try {
        await deleteMultiLayerModel(deleteForm.value.name);
        ElMessage.success("删除成功");
        deleteDialogVisible.value = false;
        fetchModels();
      } catch (error) {
        console.error("Failed to delete model:", error);
        ElMessage.error("删除失败");
      }
    };

    const openUpdateDialog = row => {
      updateForm.value.old_name = row.name;
      updateForm.value.new_name = row.name;
      updateDialogVisible.value = true;
    };

    const updateModelConfirm = async () => {
      try {
        await updateMultiLayerModel(
          updateForm.value.old_name,
          updateForm.value.new_name
        );
        ElMessage.success("修改成功");
        updateDialogVisible.value = false;
        fetchModels();
      } catch (error) {
        console.error("Failed to update model:", error);
        ElMessage.error("修改失败");
      }
    };

    const openAddDialog = () => {
      addDialogVisible.value = true;
    };

    const handleFileUpload = event => {
      const file = event.target.files[0];
      addForm.value.file = file;
    };

    const addModelConfirm = async () => {
      try {
        const formData = new FormData();
        formData.append("file", addForm.value.file);
        await addMultiLayerModel(formData);
        ElMessage.success("新增成功");
        addDialogVisible.value = false;
        fetchModels();
      } catch (error) {
        console.error("Failed to add model:", error);
        ElMessage.error("新增失败");
      }
    };

    const resetDeleteDialog = () => {
      deleteForm.value = {};
    };

    const resetUpdateDialog = () => {
      updateForm.value = {
        old_name: "",
        new_name: ""
      };
    };

    const resetAddDialog = () => {
      addForm.value = {
        file: null
      };
    };

    const downloadModel = async modelName => {
      try {
        const response = await downloadMultiLayerModel(modelName);

        // 检查响应类型，确保它是Blob
        if (response instanceof Blob) {
          // 创建一个URL链接指向Blob对象
          const url = window.URL.createObjectURL(response);

          // 创建一个隐藏的链接元素
          const link = document.createElement("a");
          link.href = url;

          // 设置下载的文件名，这里使用传入的modelName
          link.setAttribute("download", modelName);

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

    onMounted(() => {
      fetchModels();
    });

    return {
      models,
      page,
      limit,
      keyword,
      total,
      goToPage,
      deleteDialogVisible,
      updateDialogVisible,
      addDialogVisible,
      deleteForm,
      updateForm,
      addForm,
      formLabelWidth,
      fetchModels,
      searchModels,
      handlePageChange,
      goToPageNumber,
      confirmDelete,
      deleteModelConfirm,
      openUpdateDialog,
      updateModelConfirm,
      openAddDialog,
      handleFileUpload,
      addModelConfirm,
      resetDeleteDialog,
      resetUpdateDialog,
      resetAddDialog,
      downloadModel
    };
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  margin: 0 auto;
}

.title {
  display: flex;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.title el-icon {
  margin-right: 10px;
}

.search-container {
  float: right;
  margin-bottom: 20px;
}

.search-input {
  flex-grow: 1;
  margin-right: 10px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
}

.jump-to-page {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.ellipsis {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

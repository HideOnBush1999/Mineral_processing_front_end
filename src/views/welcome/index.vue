<template>
  <div class="main-container">
    <div class="outer-box" ref="outerBox">
      <h1>矿产加工多工序生产全流程高精度建模</h1>
      <div class="execution-layer box"
           @mouseenter="onExecutionLayerMouseEnter"
           @mouseleave="onExecutionLayerMouseLeave">
        <!-- 信息显示区域 -->
        <div v-if="showExecutionLayerMessage" class="layer-message">
          运行层模型的输入为过程参数，输出为产量、效率和质量等综合指标，用于构建工序整体的代理模型
        </div>
        <button class="btn tall-btn" id="momei" ref="momei" @click="onButtonClick('磨煤')">磨煤</button>
        <button class="btn tall-btn" id="guolu" ref="guolu" @click="onButtonClick('锅炉燃烧')">锅炉燃烧</button>
      </div>

      <div class="operation-layer box"
           @mouseenter="onOperationLayerMouseEnter"
           @mouseleave="onOperationLayerMouseLeave">
        <!-- 信息显示区域 -->
        <div v-if="showOperationLayerMessage" class="layer-message">
          操作层模型的输入为控制变量，输出为过程参数，通常用于构建工序某一装置的代理模型
        </div>
        <button class="btn" id="geimeiji" ref="geimeiji" @click="onButtonClick('给煤机')">给煤机</button>
        <button class="btn" id="geifengji" ref="geifengji" @click="onButtonClick('给风机')">给风机</button>
        <button class="btn" id="guolu_jinkou" ref="guolu_jinkou" @click="onButtonClick('锅炉进口空预器')">锅炉进口空预器</button>
        <button class="btn" id="jinshui" ref="jinshui" @click="onButtonClick('进水系统')">进水系统</button>
      </div>

      <svg class="arrows" ref="arrows"></svg>
    </div>

    <div class="buttons-container">
      <div class="button-with-message">
        <button class="btn">煤矸分选</button>
      </div>
      <div class="button-with-message">
        <button class="btn">因果分析</button>
      </div>
      <div class="button-with-message">
        <button class="btn">可解释</button>
      </div>
      <div class="button-with-message">
        <button class="btn"
                @mouseenter="onCorrelationAnalysisMouseEnter"
                @mouseleave="onCorrelationAnalysisMouseLeave"
                @click="goToCorrelationAnalysis">关联分析</button>
        <div v-if="showCorrelationAnalysisMessage" class="button-message">
          结合特征筛选和关联分析法，探究关键工艺参数与运行指标之间相互关系
        </div>
      </div>
      <div class="button-with-message">
        <button class="btn"
                @mouseenter="onQaChatMouseEnter"
                @mouseleave="onQaChatMouseLeave"
                @click="goToQaChat">知识问答</button>
        <div v-if="showQaChatMessage" class="button-message">
          结合知识图谱和大语言模型，构建矿场加工领域的问答系统
        </div>
      </div>
    </div>

    <!-- 抽屉组件 -->
    <div v-if="showDrawer" class="drawer">
      <div class="drawer-header">
        <h2>{{ selectedButton }} - 模型训练配置</h2>
        <button class="close-button" @click="closeDrawer">×</button>
      </div>
      <div class="drawer-content">
        <div class="drawer-section left-top">
          <!-- 数据导入部分 -->
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
              <FolderAdd />
            </el-icon>
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
          <div class="analysis-section">
            <el-row :gutter="20" align="middle">
              <!-- 关联分析和因果分析按钮 -->
              <el-col :span="12">
                <el-button type="primary" size="medium" class="analysis-btn">关联分析</el-button>
                <el-button type="primary" size="medium" class="analysis-btn">因果分析</el-button>
              </el-col>

              <!-- 开关部分 -->
              <el-col :span="12" class="switch-container">
                <span>是否使用知识数据联合驱动</span>
                <el-switch v-model="value2" class="ml-2" />
              </el-col>
            </el-row>

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
        <div class="drawer-section left-bottom">
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
              <Setting />
            </el-icon>
            <span class="section-title">参数配置</span>
          </div>

          <!-- 参数配置表单 -->
          <el-form :model="parameterConfig" label-width="150px" class="parameter-config-form">
            <el-form-item label="决策树数量">
              <el-input-number v-model="decisionTreeCount" :min="1" :step="1" style="width: 100%;"></el-input-number>
            </el-form-item>

            <el-form-item label="树的最大深度">
              <el-input-number v-model="maxDepth" :min="1" :step="1" style="width: 100%;"></el-input-number>
            </el-form-item>

            <el-form-item label="最小样本分割数">
              <el-input-number v-model="minSamplesSplit" :min="1" :step="1" style="width: 100%;"></el-input-number>
            </el-form-item>

            <el-form-item label="最小叶子节点数">
              <el-input-number v-model="minSamplesLeaf" :min="1" :step="1" style="width: 100%;"></el-input-number>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="applyParameters">应用参数</el-button>
              <el-button  type="primary" @click="resetParameters" style="margin-left: 20px;">重置</el-button>
              <el-button type="primary" @click="trainModel" style="margin-left: 20px;">模型训练</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 模型管理部分 -->
        <div class="drawer-section right-top">
          <div class="icon-text-container">
            <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc">
              <Box />
            </el-icon>
            <span class="section-title">模型管理</span>
          </div>
          <!-- 模型管理 -->
          <div class="model-management">
            <el-table
              :data="models"
              style="width: 100%"
              :border="true"
              :size="'medium'"
              >
              <el-table-column
                prop="name"
                label="模型名称"
                width="200">
              </el-table-column>
              <el-table-column
                label="操作"
                width="500">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    plain
                    @click="displayModel(scope.row)"
                    icon="Search"
                    >模型展示</el-button>
                  <el-button
                    type="primary"
                    size="small"
                    plain
                    @click="explainModel(scope.row)"
                    style="margin-left: 10px;"
                    icon="Share"
                    >模型解释</el-button>
                  <el-button
                    type="danger"
                    size="small"
                    plain
                    icon="Delete"
                    @click="deleteModel(scope.row)"
                    style="margin-left: 10px;"
                    >删除</el-button>
                  <el-button
                    type="info"
                    size="small"
                    plain
                    @click="downloadModel(scope.row)"
                    style="margin-left: 10px;"
                    icon="Download"
                    >下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 模型展示部分 -->
        <div class="drawer-section right-bottom">
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
              <span><strong>MSE:</strong> {{ modelPerformance.MSE !== null ? modelPerformance.MSE : '待计算' }}</span>
              <span><strong>R²:</strong> {{ modelPerformance.R2 !== null ? modelPerformance.R2 : '待计算' }}</span>
            </div>
            <!-- 模型对比图占位 -->
            <div class="chart-placeholder">
              <img v-if="modelPerformance.comparisonChartUrl" :src="modelPerformance.comparisonChartUrl" alt="模型对比图" />
              <div v-else class="placeholder">
                <span>模型真值与拟合值对比图</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { ref } from 'vue';
import 'element-plus/dist/index.css';

import {
  ElMessage,
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
} from 'element-plus';
import { FolderAdd, Setting, Box, Monitor } from '@element-plus/icons-vue'; // 引入所需的图标

export default {
  name: 'FlowDiagram',
  components: {
    ElMessage,
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
    FolderAdd,
    Setting,
    Box,
    Monitor
  },
  data() {
    return {
      showExecutionLayerMessage: false,
      showOperationLayerMessage: false,
      showCorrelationAnalysisMessage: false,
      showQaChatMessage: false,
      showDrawer: false,
      selectedButton: '',
      selectedModel: '随机森林',
      radio: 3, // 设置默认选中为3（随机森林）
      value2: true, // 设置开关的初始值
      inputFile: null,
      outputFile: null,
      // 参数配置
      decisionTreeCount: 100,    // 决策树数量
      maxDepth: 10,              // 树的最大深度
      minSamplesSplit: 2,        // 最小样本分割数
      minSamplesLeaf: 1,         // 最小叶子节点数
      // 模型管理
      models: [
        { id: 1, name: '模型A' },
        { id: 2, name: '模型B' },
        { id: 3, name: '模型C' },
        { id: 4, name: '模型D' },
        { id: 5, name: '模型E' },
        { id: 6, name: '模型F' },
        { id: 7, name: '模型G' },
        // 可以根据实际情况动态添加模型
      ],
      // 模型展示
      modelPerformance: {
        MSE: null,
        R2: null,
        comparisonChartUrl: '' // 模型对比图的 URL，初始为空
      },
      // 其他数据属性...
    };
  },
  mounted() {
    this.drawArrows();
    window.addEventListener('resize', this.drawArrows); // 在窗口调整大小时重新绘制箭头
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.drawArrows);
  },
  methods: {
    drawArrows() {
      const svg = d3.select(this.$refs.arrows);
      svg.selectAll('*').remove(); // 清除之前的箭头

      // 定义箭头
      svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 7)
        .attr('refX', 0)
        .attr('refY', 3.5)
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth')
        .append('path')
        .attr('d', 'M0,0 L0,7 L10,3.5 z')
        .attr('fill', '#000');

      // 获取按钮的位置和大小
      const getButtonInfo = (ref) => {
        const button = this.$refs[ref];
        if (!button) return { x: 0, y: 0 };
        const rect = button.getBoundingClientRect();
        const containerRect = this.$refs.outerBox.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
          width: rect.width,
          height: rect.height,
          left: rect.left - containerRect.left,
          right: rect.right - containerRect.left,
          top: rect.top - containerRect.top,
          bottom: rect.bottom - containerRect.top,
        };
      };

      // 定义连接
      const connections = [
        { source: 'geimeiji', target: 'momei', vertical: true },
        { source: 'geifengji', target: 'momei', vertical: true },
        { source: 'guolu_jinkou', target: 'guolu', vertical: true },
        { source: 'jinshui', target: 'guolu', vertical: true },
        { source: 'momei', target: 'guolu', vertical: false }
      ];

      // 设置SVG尺寸
      const outerBox = this.$refs.outerBox;
      const width = outerBox.clientWidth;
      const height = outerBox.clientHeight;

      svg
        .attr('width', width)
        .attr('height', height)
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0);

      // 绘制箭头
      connections.forEach(conn => {
        const sourcePos = getButtonInfo(conn.source);
        const targetPos = getButtonInfo(conn.target);

        let x1, y1, x2, y2;

        if (conn.vertical) {
          x1 = sourcePos.x;
          x2 = x1; // 垂直线

          const offset = 10; // 根据需要调整

          y1 = sourcePos.y - sourcePos.height / 2 - offset; // 从源按钮上方开始
          y2 = targetPos.y + targetPos.height / 2 + offset + 45; // 到目标按钮下方结束
        } else {
          // 修改后的水平箭头绘制
          x1 = sourcePos.right;
          y1 = sourcePos.y;
          x2 = targetPos.left;
          y2 = targetPos.y;

          // 调整起点和终点以避免覆盖按钮
          const offset = 10; // 根据需要调整

          x1 += offset; // 从源按钮的右边缘开始
          x2 -= (offset + 45); // 到目标按钮的左边缘结束
        }

        svg.append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', '#000')
          .attr('stroke-width', 6)
          .attr('marker-end', 'url(#arrowhead)');
      });
    },
    // 添加导航方法
    goToCorrelationAnalysis() {
      this.$router.push('/correlationAnalysis/parameterExtraction');
    },
    goToQaChat() {
      this.$router.push('/qa/chat');
    },
    // 鼠标事件处理函数
    onExecutionLayerMouseEnter() {
      this.showExecutionLayerMessage = true;
    },
    onExecutionLayerMouseLeave() {
      this.showExecutionLayerMessage = false;
    },
    onOperationLayerMouseEnter() {
      this.showOperationLayerMessage = true;
    },
    onOperationLayerMouseLeave() {
      this.showOperationLayerMessage = false;
    },
    onCorrelationAnalysisMouseEnter() {
      this.showCorrelationAnalysisMessage = true;
    },
    onCorrelationAnalysisMouseLeave() {
      this.showCorrelationAnalysisMessage = false;
    },
    onQaChatMouseEnter() {
      this.showQaChatMessage = true;
    },
    onQaChatMouseLeave() {
      this.showQaChatMessage = false;
    },
    // 点击按钮显示抽屉
    onButtonClick(buttonName) {
      this.selectedButton = buttonName;
      this.showDrawer = true;
    },
    // 关闭抽屉
    closeDrawer() {
      this.showDrawer = false;
    },
    // 文件上传处理
    handleInputFileUpload(event) {
      const file = event.target.files[0];
      this.inputFile = file;
      // 处理文件上传逻辑
    },
    handleOutputFileUpload(event) {
      const file = event.target.files[0];
      this.outputFile = file;
      // 处理文件上传逻辑
    },
    uploadInputFile() {
      if (!this.inputFile) {
        ElMessage.error("请选择输入数据集文件");
        return;
      }
      // 实现文件上传逻辑，例如调用 API
      ElMessage.success("输入数据集文件上传成功");
    },
    uploadOutputFile() {
      if (!this.outputFile) {
        ElMessage.error("请选择输出数据集文件");
        return;
      }
      // 实现文件上传逻辑，例如调用 API
      ElMessage.success("输出数据集文件上传成功");
    },
    // 参数配置方法
    applyParameters() {
      // 在这里处理参数应用逻辑，例如触发模型重新训练
      ElMessage.success('参数已应用');
      // 例如：
      // this.trainModel({
      //   decisionTreeCount: this.decisionTreeCount,
      //   maxDepth: this.maxDepth,
      //   minSamplesSplit: this.minSamplesSplit,
      //   minSamplesLeaf: this.minSamplesLeaf
      // });
    },
    resetParameters() {
      this.decisionTreeCount = 100;
      this.maxDepth = 10;
      this.minSamplesSplit = 2;
      this.minSamplesLeaf = 1;
      ElMessage.info('参数已重置');
    },
    // 模型管理方法
    displayModel(model) {
      // 实现模型展示逻辑，例如打开一个模态框展示模型详情
      ElMessage.info(`展示模型: ${model.name}`);
      // 示例：设置模型性能数据
      this.modelPerformance.MSE = null; // 重置 MSE
      this.modelPerformance.R2 = null;  // 重置 R²
      this.modelPerformance.comparisonChartUrl = ''; // 重置对比图

      // 如果有实际数据，可以在这里进行赋值
      // 例如通过 API 获取模型性能数据和对比图
    },
    explainModel(model) {
      // 实现模型解释逻辑，例如打开一个模态框展示模型解释
      ElMessage.info(`解释模型: ${model.name}`);
      // 例如：
      // this.$router.push(`/models/${model.id}/explain`);
    },
    deleteModel(model) {
      // 确认删除
      this.$confirm(`确定要删除模型 "${model.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        // 实现删除逻辑，例如调用 API 删除模型
        this.models = this.models.filter(m => m.id !== model.id);
        ElMessage.success(`模型 "${model.name}" 已删除`);
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    },
    downloadModel(model) {
      // 实现模型下载逻辑，例如调用 API 获取下载链接
      ElMessage.success(`模型 "${model.name}" 下载成功`);
      // 例如：
      // window.open(`/api/models/${model.id}/download`);
    },
    // 其他方法...
  }
};
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}

.outer-box {
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 550px; /* 增加高度 */
  border: 2px solid #ccc;
  padding: 40px 20px;
  margin-bottom: 20px;
  border-radius: 10px; /* 添加圆角 */
}

.box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: 20px 0 60px 0;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 10px; /* 添加圆角 */
  position: relative; /* 确保子元素的绝对定位是相对于这个容器 */
}

.execution-layer {
  position: relative;
  z-index: 1;
  border-radius: 10px; /* 添加圆角 */
}

.operation-layer {
  position: relative;
  z-index: 1;
  border-radius: 10px; /* 添加圆角 */
}

.btn {
  padding: 20px 30px;
  margin: 10px;
  font-size: 24px; /* 增加字体大小 */
  width: 180px;    /* 增加宽度 */
  height: 100px;   /* 增加高度 */
  background-color: #005bac;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 10px; /* 添加圆角 */
  position: relative;
}

.tall-btn {
  height: 140px; /* 增加高度 */
  width: 420px;  /* 增加宽度 */
}

.btn:hover {
  background-color: #004a8f;
}

.buttons-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
  flex-wrap: wrap; /* 允许按钮换行 */
}

.outer-box h1 {
  text-align: center;
  width: 100%; /* 确保 h1 占满父容器宽度 */
  font-size: 2rem; /* 设置更大的字体大小 */
  color: #333;
  position: relative;
  z-index: 1;
}

/* 新增的样式 */
.layer-message {
  position: absolute;
  top: -30px; /* 根据需要调整 */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  z-index: 2;
  width: 80%;
  text-align: center;
  font-size: 16px;
}

.button-with-message {
  position: relative;
  display: flex;
  flex-direction: column; /* 垂直排列按钮和消息 */
  align-items: center;
  margin: 10px;
}

.button-message {
  position: absolute;
  bottom: 110%; /* 消息框在按钮上方 */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  z-index: 2;
  width: 220px; /* 根据需要调整宽度 */
  text-align: center;
  font-size: 16px;
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

.left-top {
  /* 左上角 */
}

.left-bottom {
  /* 左下角 */
}

.right-top {
  /* 右上角 */
}

.right-bottom {
  /* 右下角 */
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
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px; /* 可选：添加圆角 */
}
</style>

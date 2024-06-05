<template>
  <div class="container">
    <!-- 左侧部分 -->
    <div class="left">
      <!-- 数据导入部分 -->
      <div class="data-import">
        <h1 style="font-size: 30px">关联度分析</h1>
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc"
            ><FolderAdd
          /></el-icon>
          <span class="section-title">数据导入</span>
        </div>
      </div>
      <!-- 数据展示和建立随机森林模型部分 -->
      <div class="data-display">
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc"
            ><DataLine
          /></el-icon>
          <span class="section-title">表格展示</span>
        </div>
      </div>
    </div>

    <!-- 右侧部分 -->
    <div class="right">
      <div class="model-display">
        <div class="icon-text-container">
          <el-icon size="32px" style="margin-top: -10px; color: #2d7dbc"
            ><Histogram
          /></el-icon>
          <div class="section-title">灰度关联图展示</div>
        </div>
        <div />
      </div>
    </div>
  </div>
</template>

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

.icon-text-container {
  display: flex;
  gap: 10px; /* 设置图标和文本之间的间隙 */
  align-items: center; /* 垂直居中 */
}

.data-display {
  box-sizing: border-box;
  flex: 1;
  padding: 20px;
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
</style>

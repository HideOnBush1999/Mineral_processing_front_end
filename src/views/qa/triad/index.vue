<template>
  <div class="container">
    <el-card class="management-card">
      <div class="title">
        <el-icon style="font-size: 30px"><Setting /></el-icon>
        <h1>三元组管理</h1>
      </div>
      <div class="search-container">
        <el-input
          v-model="keyword"
          placeholder="输入关键词搜索"
          @input="searchTriples"
          clearable
          class="search-input"
          style="width: 300px"
        />
        <el-button @click="searchTriples" type="primary" plain icon="Search">
          搜索
        </el-button>
        <el-button @click="openAddDialog" type="success" plain icon="Plus">
          新增
        </el-button>
        <!-- 3D展示按钮 -->
        <el-button @click="openDrawer" type="info" plain icon="Eye">
          3D展示
        </el-button>
        <!-- 2D展示按钮 -->
        <el-button @click="open2DDrawer" type="info" plain icon="Eye">
          2D展示
        </el-button>
      </div>
      <el-table :data="triples" style="width: 100%" stripe>
        <el-table-column prop="subject" label="主体">
          <template #default="scope">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row.subject"
              placement="top"
            >
              <span class="ellipsis">{{ scope.row.subject }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="relation" label="关系">
          <template #default="scope">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row.relation"
              placement="top"
            >
              <span class="ellipsis">{{ scope.row.relation }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="object" label="客体">
          <template #default="scope">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row.object"
              placement="top"
            >
              <span class="ellipsis">{{ scope.row.object }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <template v-if="!scope.row.is_empty">
              <el-button
                @click="openUpdateDialog(scope.row)"
                type="primary"
                size="small"
                plain
                icon="Edit"
              >
                修改
              </el-button>
              <el-button
                @click="confirmDelete(scope.row)"
                type="danger"
                size="small"
                plain
                icon="Delete"
              >
                删除
              </el-button>
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
          <el-button @click="goToPageNumber" plain icon="Location">
            跳转
          </el-button>
        </div>
      </div>

      <!-- 删除确认对话框 -->
      <el-dialog
        title="确认删除"
        v-model="deleteDialogVisible"
        width="30%"
        @close="resetDeleteDialog"
      >
        <span>确认要删除这个三元组吗？</span>
        <template #footer>
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="deleteTraidConfirm">确认</el-button>
        </template>
      </el-dialog>

      <!-- 修改对话框 -->
      <el-dialog
        title="修改三元组"
        v-model="updateDialogVisible"
        width="50%"
        @close="resetUpdateDialog"
      >
        <el-form :model="updateForm">
          <el-form-item label="主体" :label-width="formLabelWidth">
            <el-input v-model="updateForm.new_subject" />
          </el-form-item>
          <el-form-item label="关系" :label-width="formLabelWidth">
            <el-input v-model="updateForm.new_relation" />
          </el-form-item>
          <el-form-item label="客体" :label-width="formLabelWidth">
            <el-input v-model="updateForm.new_object" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateTraidConfirm">确认</el-button>
        </template>
      </el-dialog>

      <!-- 新增对话框 -->
      <el-dialog
        title="新增三元组"
        v-model="addDialogVisible"
        width="50%"
        @close="resetAddDialog"
      >
        <el-form :model="addForm">
          <el-form-item label="主体" :label-width="formLabelWidth">
            <el-input v-model="addForm.subject" />
          </el-form-item>
          <el-form-item label="关系" :label-width="formLabelWidth">
            <el-input v-model="addForm.relation" />
          </el-form-item>
          <el-form-item label="客体" :label-width="formLabelWidth">
            <el-input v-model="addForm.object" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addTraidConfirm">确认</el-button>
        </template>
      </el-dialog>

      <!-- 3D知识图谱展示抽屉 -->
      <el-drawer
        title="三元组知识图谱展示"
        v-model="drawerVisible"
        size="80%"
        direction="rtl"
        :before-close="handleDrawerClose"
      >
        <div ref="graphContainer" class="graph-container"></div>
        <template #footer>
          <el-button @click="drawerVisible = false">关闭</el-button>
        </template>
      </el-drawer>

      <!-- 2D知识图谱展示抽屉 -->
      <el-drawer
        title="三元组知识图谱2D展示"
        v-model="drawer2DVisible"
        size="80%"
        direction="rtl"
        :before-close="handle2DDrawerClose"
      >
        <div ref="graph2DContainer" class="graph-container"></div>
        <template #footer>
          <el-button @click="drawer2DVisible = false">关闭</el-button>
        </template>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from "vue";
import {
  getTraids,
  searchTraid,
  updateTraid,
  deleteTraid,
  addTraid,
  getAllTraids
} from "@/api/qa";
import { ElMessage } from "element-plus";
import ForceGraph3D from "3d-force-graph";
import ForceGraph2D from "force-graph"; // 改为明确的名称
import * as d3 from "d3"; // 引入d3库

export default {
  setup() {
    const triples = ref([]);
    const page = ref(1);
    const limit = ref(10);
    const keyword = ref("");
    const total = ref(0);
    const goToPage = ref(null);

    const deleteDialogVisible = ref(false);
    const updateDialogVisible = ref(false);
    const addDialogVisible = ref(false);

    // 抽屉可见性变量
    const drawerVisible = ref(false);
    const drawer2DVisible = ref(false); // 新增的2D抽屉可见性变量

    const deleteForm = ref({});
    const updateForm = ref({
      old_subject: "",
      old_relation: "",
      old_object: "",
      new_subject: "",
      new_relation: "",
      new_object: ""
    });
    const addForm = ref({
      subject: "",
      relation: "",
      object: ""
    });

    const formLabelWidth = "80px";

    const graphContainer = ref(null);
    let fg = null;

    const graph2DContainer = ref(null); // 新增的2D图谱容器
    let fg2D = null;

    const fetchTriples = async () => {
      try {
        const response = await getTraids(page.value, limit.value);
        triples.value = response.data;
        total.value = response.total;
        goToPage.value = null;
      } catch (error) {
        console.error("Failed to fetch triples:", error);
        ElMessage.error("获取三元组失败");
      }
    };

    const searchTriples = async () => {
      try {
        if (keyword.value) {
          const response = await searchTraid(keyword.value);
          triples.value = response.data;
          total.value = response.total;
        } else {
          fetchTriples();
        }
      } catch (error) {
        console.error("Failed to search triples:", error);
        ElMessage.error("搜索三元组失败");
      }
    };

    const handlePageChange = newPage => {
      page.value = newPage;
      fetchTriples();
    };

    const goToPageNumber = () => {
      const pageNumber = parseInt(goToPage.value, 10);
      if (
        pageNumber &&
        pageNumber > 0 &&
        pageNumber <= Math.ceil(total.value / limit.value)
      ) {
        page.value = pageNumber;
        fetchTriples();
      } else {
        ElMessage.error("页码超出范围");
      }
    };

    const confirmDelete = row => {
      deleteForm.value = { ...row };
      deleteDialogVisible.value = true;
    };

    const deleteTraidConfirm = async () => {
      try {
        await deleteTraid(deleteForm.value);
        ElMessage.success("删除成功");
        deleteDialogVisible.value = false;
        fetchTriples();
      } catch (error) {
        console.error("Failed to delete triple:", error);
        ElMessage.error("删除失败");
      }
    };

    const openUpdateDialog = row => {
      updateForm.value.old_subject = row.subject;
      updateForm.value.old_relation = row.relation;
      updateForm.value.old_object = row.object;
      updateForm.value.new_subject = row.subject;
      updateForm.value.new_relation = row.relation;
      updateForm.value.new_object = row.object;
      updateDialogVisible.value = true;
    };

    const updateTraidConfirm = async () => {
      try {
        await updateTraid(updateForm.value);
        ElMessage.success("修改成功");
        updateDialogVisible.value = false;
        fetchTriples();
      } catch (error) {
        console.error("Failed to update triple:", error);
        ElMessage.error("修改失败");
      }
    };

    const openAddDialog = () => {
      addDialogVisible.value = true;
    };

    const addTraidConfirm = async () => {
      try {
        await addTraid(addForm.value);
        ElMessage.success("新增成功");
        addDialogVisible.value = false;
        fetchTriples();
      } catch (error) {
        console.error("Failed to add triple:", error);
        ElMessage.error("新增失败");
      }
    };

    const openDrawer = () => {
      drawerVisible.value = true;
    };

    const handleDrawerClose = () => {
      if (fg) {
        fg.scene().dispose();
        fg = null;
      }
    };

    const open2DDrawer = () => {
      drawer2DVisible.value = true;
    };

    const handle2DDrawerClose = () => {
      if (fg2D) {
        fg2D.pauseAnimation();
        fg2D = null;
      }
    };

    // 初始化和渲染3D力导向图
    const renderGraph = async () => {
      if (!graphContainer.value) return;

      try {
        // 获取所有三元组
        const response = await getAllTraids();
        const allTriples = response.data;

        if (!Array.isArray(allTriples) || allTriples.length === 0) {
          ElMessage.warning("没有可展示的三元组数据");
          return;
        }

        // 准备数据
        const data = {
          nodes: [],
          links: []
        };

        // 转换为 nodes 和 links
        const nodeSet = new Set();
        allTriples.forEach(triple => {
          nodeSet.add(triple.subject);
          nodeSet.add(triple.object);
          data.links.push({
            source: triple.subject,
            target: triple.object,
            label: triple.relation
          });
        });

        nodeSet.forEach(node => {
          data.nodes.push({ id: node, name: node });
        });

        // 创建3D力导向图
        fg = ForceGraph3D()(graphContainer.value)
          .graphData(data)
          .nodeAutoColorBy('id')
          .linkDirectionalParticles(2)
          .linkDirectionalParticleWidth(1)
          .nodeLabel('name')
          .linkLabel('label')
          .onNodeHover(node => {
            // 可选：处理节点悬停事件
          })
          .onLinkHover(link => {
            // 可选：处理链接悬停事件
          })
          .onNodeClick(node => {
            // 可选：处理节点点击事件
            ElMessage.info(`点击节点：${node.name}`);
          });

        // 可选：调整相机位置
        fg.cameraPosition(
          { x: 0, y: 0, z: 400 }, // 相机位置
          { x: 0, y: 0, z: 0 },   // 目标位置
          1000                    // 动画持续时间
        );
      } catch (error) {
        console.error("Failed to fetch all triples for graph:", error);
        ElMessage.error("获取全部三元组失败");
      }
    };


    const renderGraph2D = async () => {
      if (!graph2DContainer.value) return;

      try {
        // 获取所有三元组
        const response = await getAllTraids();
        const allTriples = response.data;

        if (!Array.isArray(allTriples) || allTriples.length === 0) {
          ElMessage.warning("没有可展示的三元组数据");
          return;
        }

        // 准备数据
        const data = {
          nodes: [],
          links: []
        };

        const nodeSet = new Set();
        allTriples.forEach(triple => {
          nodeSet.add(triple.subject);
          nodeSet.add(triple.object);
          data.links.push({
            source: triple.subject,
            target: triple.object,
            label: triple.relation,
            distance: 100 // 或根据需要设置不同的距离
          });
        });

        nodeSet.forEach(node => {
          data.nodes.push({ id: node, name: node });
        });

        // 创建2D力导向图
        fg2D = ForceGraph2D()(graph2DContainer.value)
          .graphData(data)
          .nodeAutoColorBy('id')
          .nodeLabel('name')
          .linkLabel('label')
          .linkDirectionalArrowLength(6) // 添加箭头，长度为6
          .linkDirectionalArrowRelPos(1) // 箭头位置在边的终点（1表示终点，0表示起点）
          .onNodeClick(node => {
            ElMessage.info(`点击节点：${node.name}`);
          })
          .nodeCanvasObject((node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 16 / globalScale; // 调整字体大小
            ctx.font = `${fontSize}px Sans-Serif`;

            const nodeRadius = 20; // 调整节点半径

            // 准备文本，若超出则截断并添加省略号
            let displayLabel = label;
            const maxTextWidth = nodeRadius * 2 - 10; // 调整内边距
            let textWidth = ctx.measureText(displayLabel).width;

            if (textWidth > maxTextWidth) {
              while (textWidth > maxTextWidth && displayLabel.length > 0) {
                displayLabel = displayLabel.slice(0, -1);
                textWidth = ctx.measureText(displayLabel + '...').width;
              }
              displayLabel += '...';
            }

            // 绘制圆圈
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color || 'rgba(31, 120, 180, 0.8)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.stroke();

            // 绘制文本
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(displayLabel, node.x, node.y);
          })
          .nodePointerAreaPaint((node, color, ctx) => {
            // 定义节点的交互区域，确保节点可拖动
            const nodeRadius = 20; // 与绘制节点时的半径保持一致
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fill();
          })
          .linkCanvasObjectMode(() => 'after') // 确保关系标签在绘制之后
          .linkCanvasObject((link, ctx, globalScale) => {
            const label = link.label;
            if (!label) return;

            const start = link.source;
            const end = link.target;

            // 计算边的中点
            const middlePos = {
              x: start.x + (end.x - start.x) * 0.5,
              y: start.y + (end.y - start.y) * 0.5
            };

            const fontSize = 14 / globalScale; // 调整字体大小
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, middlePos.x, middlePos.y);
          });

        // 添加碰撞检测，防止节点重叠
        fg2D.d3Force('collision', d3.forceCollide(25)); // 25 = nodeRadius (20) + 间距 (5)

        // 设置链接距离
        fg2D.d3Force('link').distance(link => {
          return link.distance || 100; // 使用链接的 distance 属性，或默认值100
        });

        // 如果所有链接使用相同的距离，可以直接设置一个固定值
        // fg2D.d3Force('link').distance(100);
      } catch (error) {
        console.error("Failed to fetch all triples for 2D graph:", error);
        ElMessage.error("获取全部三元组失败");
      }
    };



    // 监听3D抽屉打开事件，渲染图谱
    watch(drawerVisible, async (newVal) => {
      if (newVal) {
        await nextTick();
        await renderGraph();
      } else {
        // 当抽屉关闭时，销毁图谱实例
        if (fg) {
          fg.scene().dispose();
          fg = null;
        }
      }
    });

    // 监听2D抽屉打开事件，渲染2D图谱
    watch(drawer2DVisible, async (newVal) => {
      if (newVal) {
        await nextTick();
        await renderGraph2D();
      } else {
        // 当抽屉关闭时，销毁图谱实例
        if (fg2D) {
          fg2D.pauseAnimation();
          fg2D = null;
        }
      }
    });

    const resetDeleteDialog = () => {
      deleteForm.value = {};
    };

    const resetUpdateDialog = () => {
      updateForm.value = {
        old_subject: "",
        old_relation: "",
        old_object: "",
        new_subject: "",
        new_relation: "",
        new_object: ""
      };
    };

    const resetAddDialog = () => {
      addForm.value = {
        subject: "",
        relation: "",
        object: ""
      };
    };

    onMounted(() => {
      fetchTriples();
    });

    return {
      triples,
      page,
      limit,
      keyword,
      total,
      goToPage,
      deleteDialogVisible,
      updateDialogVisible,
      addDialogVisible,
      drawerVisible,
      graphContainer,
      drawer2DVisible, // 新增的2D抽屉可见性变量
      graph2DContainer, // 新增的2D图谱容器
      deleteForm,
      updateForm,
      addForm,
      formLabelWidth,
      fetchTriples,
      searchTriples,
      handlePageChange,
      goToPageNumber,
      confirmDelete,
      deleteTraidConfirm,
      openUpdateDialog,
      updateTraidConfirm,
      openAddDialog,
      addTraidConfirm,
      openDrawer,
      handleDrawerClose,
      open2DDrawer, // 新增的打开2D抽屉的函数
      handle2DDrawerClose, // 新增的关闭2D抽屉的函数
      resetDeleteDialog,
      resetUpdateDialog,
      resetAddDialog
    };
  }
};
</script>

<style scoped>
.container {
  width: 90%;
  padding-top: 20px;
  margin: 0 auto;
}

.management-card {
  padding: 20px;
}

.title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  color: #409eff;
}

.title el-icon {
  margin-right: 40px; /* 增加间隔 */
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 改为右对齐 */
  margin-bottom: 20px;
}

.search-input {
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

/* 可选：移除表格行悬停时的阴影效果 */
.el-table .el-table__row:hover {
  box-shadow: none !important;
}

/* 图谱容器样式 */
.graph-container {
  width: 100%;
  height: 600px; /* 根据需要调整高度 */
}

/* 确保抽屉内容滚动 */
.el-drawer__body {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

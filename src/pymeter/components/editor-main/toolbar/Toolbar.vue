<template>
  <div v-show="showToolBar" class="toolbar-container">
    <!-- 操作栏 -->
    <div class="toolbar-main">
      <!-- 左侧：组件名称 -->
      <div class="l-container">
        <span class="component-name">{{ componentName }}</span>
        <template v-if="showElementPath">
          <span class="element-path">
            <b>：</b>
            {{ props.metadata.path }} / {{ props.metadata.name }}
          </span>
        </template>
      </div>

      <!-- 右侧：操作区域 -->
      <div class="r-container">
        <!-- 元素历史按钮 -->
        <el-button
          v-show="showHistoryBTN"
          style="padding-right: 20px"
          type="primary"
          link
          @click="showChangelog = true"
        >
          <SvgIcon icon-name="common-changelog" style="font-size: 20px" />
        </el-button>
        <!-- 变量集 -->
        <span class="dataset-container">
          <!-- 变量集选择器 -->
          <DatasetSelect :show="showToolBar" />
          <!-- 查看变量按钮 -->
          <el-button style="padding-right: 5px" type="primary" link @click="showDatasetDialog = true">
            <SvgIcon icon-name="pymeter-show-data" style="font-size: 20px" />
          </el-button>
        </span>
      </div>
    </div>

    <!-- 华丽丽的分割线 -->
    <el-divider />

    <!-- 变量详情视图 -->
    <DatasetDialog v-if="showDatasetDialog" v-model="showDatasetDialog" />

    <!-- 元素变更日志 -->
    <ChangeLogDrawer v-model="showChangelog" destroy-on-close />
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import DatasetSelect from './DatasetSelect.vue'
import DatasetDialog from './DatasetDialog.vue'
import ChangeLogDrawer from './ChangeLogDrawer.vue'

const props = defineProps({
  component: { type: String, default: '' },
  metadata: { type: Object, default: () => {} }
})
// 组件名称
const componentNames = {
  TestWorkspace: '测试空间',
  TestCollection: '测试集合',
  TestSnippet: '测试片段',
  TestWorker: '测试用例',
  SetupWorker: '前置用例',
  TeardownWorker: '后置用例',
  IfController: 'IF分支',
  WhileController: 'While循环',
  LoopController: 'Loop循环',
  ForeachController: 'Foreach循环',
  RetryController: '重试循环',
  TransactionController: '事务',
  SQLSampler: '数据库请求',
  HTTPSampler: 'HTTP请求',
  PythonSampler: 'Python请求',
  SnippetSampler: '片段请求',
  DatabaseEngine: '数据库配置器'
}
// 组件名称
const componentName = computed(() => componentNames[props.component])
// 是否显示操作栏的标识
const showToolBar = computed(() => !isEmpty(componentName.value))
// 是否显示元素历史按钮
const showHistoryBTN = computed(() => !isEmpty(props.metadata?.sn))
// 是否显示元素路径
const showElementPath = computed(() => !isEmpty(props.metadata?.path))
// 是否显示变更日志
const showChangelog = ref(false)
// 是否显示变量详情视图
const showDatasetDialog = ref(false)
</script>

<style lang="scss" scoped>
.toolbar-container {
  padding: 0 10px;

  .el-divider--horizontal {
    margin: 10px 0;
  }
}

.toolbar-main {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.l-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  margin-left: 4px;
  box-shadow: -4px 0 0 0 #f56c6c;
}

.r-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.element-path {
  margin-right: 10px;
  font-size: 16px;
  user-select: none;
}

.component-name {
  font-size: 16px;
  font-weight: bold;
  user-select: none;
}

.dataset-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.el-button--text {
  margin: 0 5px;
  font-size: 15px;

  :deep(.el-icon-view) {
    font-weight: 500;
  }
}
</style>

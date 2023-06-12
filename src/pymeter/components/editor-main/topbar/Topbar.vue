<template>
  <div v-show="show" class="topbar-container">
    <!-- 操作栏 -->
    <div class="topbar-main">
      <!-- 左侧：组件名称 -->
      <div class="component-name">{{ componentName }}</div>

      <!-- 右侧：操作区域 -->
      <span class="dataset-container">
        <!-- 变量集选择器 -->
        <DatasetSelect :show="show" />
        <!-- 查看变量按钮 -->
        <el-button
          style="padding-right: 5px; outline: none; font-size: 16px"
          type="primary"
          link
          :icon="View"
          @click="showVariablesDialog = true"
        />
      </span>
    </div>

    <!-- 华丽丽的分割线 -->
    <el-divider />

    <!-- 变量详情视图 -->
    <VariablesDialog v-if="showVariablesDialog" v-model="showVariablesDialog" />
  </div>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import { View } from '@element-plus/icons-vue'
import DatasetSelect from './DatasetSelect.vue'
import VariablesDialog from './VariablesDialog.vue'

const props = defineProps({
  component: { type: String, default: '' }
})
// 组件名称
const componentNames = reactive({
  TestCollection: '测试集合',
  SnippetCollection: '测试片段',
  TestWorker: '测试用例',
  SetupWorker: '前置用例',
  TeardownWorker: '后置用例',
  SetupDebuger: '前置调试器',
  TeardownDebuger: '后置调试器',
  IfController: 'If控制器',
  WhileController: 'While控制器',
  ForInController: '遍历控制器',
  LoopController: '循环控制器',
  RetryController: '重试控制器',
  TransactionController: '事务控制器',
  HTTPSampler: 'HTTP请求',
  PythonSampler: 'Python请求',
  SnippetSampler: 'Snippet请求',
  SQLSampler: 'SQL请求',
  PythonPreProcessor: 'Python前置脚本',
  PythonPostProcessor: 'Python后置脚本',
  PythonAssertion: 'Python断言',
  ConstantTimer: '固定定时器',
  DatabaseEngine: '数据库配置器',
  WorkspaceComponents: '空间组件'
})
// 是否显示变量详情视图
const showVariablesDialog = ref(false)
// 组件名称
const componentName = computed(() => componentNames[props.component])
// 是否显示操作栏的标识
const show = computed(() => !_isEmpty(componentName.value))
</script>

<style lang="scss" scoped>
.topbar-container {
  padding: 0 10px;

  .el-divider--horizontal {
    margin: 10px 0;
  }
}

.topbar-main {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
}

.component-name {
  font-weight: bold;
  font-size: 16px;
  margin-left: 4px;
  box-shadow: -4px 0 0 0 #f56c6c;
  padding: 0 10px;
  user-select: none;
}

.dataset-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.el-button--text {
  margin: 0 5px;
  font-size: 15px;

  :deep(.el-icon-view) {
    font-weight: 500;
  }
}
</style>

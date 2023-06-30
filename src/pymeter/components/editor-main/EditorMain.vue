<template>
  <el-card shadow="hover">
    <template v-if="pymeterStore.tabs.length > 0">
      <!-- tabs头 -->
      <el-tabs v-model="pymeterStore.activeTabNo" type="card" closable @tab-remove="handleTabRemove">
        <el-tab-pane
          v-for="tab in pymeterStore.tabs"
          :key="tab.editorNo"
          :label="tab.editorName"
          :name="tab.editorNo"
        />
      </el-tabs>

      <!-- 顶栏 -->
      <Topbar :component="activeTab.editorComponent" />

      <!-- pymeter 组件 -->
      <el-scrollbar id="editor-main-scrollbar" style="width: 100%; height: 100%" wrap-style="overflow-x:auto;">
        <keep-alive ref="keepAliveRef">
          <component
            :is="editors[activeTab.editorComponent]"
            :key="activeTab.editorNo"
            :editor-no="activeTab.editorNo"
            :editor-mode="activeTab.editorMode"
            :metadata="activeTab.metadata"
          />
        </keep-alive>
      </el-scrollbar>

      <!-- 回到顶部按钮 -->
      <el-backtop target="#editor-main-scrollbar .el-scrollbar__wrap" :right="20" :bottom="60" />
    </template>

    <!-- 占位图 -->
    <template v-else>
      <div style="display: flex;align-items: center; justify-content: center; height: 100%;}">
        <SvgIcon icon-name="undraw-programming" style="font-size: 400px" />
      </div>
    </template>
  </el-card>
</template>

<script setup>
import { usePyMeterStore } from '@/store/pymeter'
import Topbar from './topbar/Topbar.vue'
import Mousetrap from 'mousetrap'

const editors = reactive({
  // collection
  TestCollection: markRaw(defineAsyncComponent(() => import('./collections/TestCollection.vue'))),
  SnippetCollection: markRaw(
    defineAsyncComponent(() => import('./collections/snippet-collection/SnippetCollection.vue'))
  ),
  // worker
  TestWorker: markRaw(defineAsyncComponent(() => import('./workers/TestWorker.vue'))),
  SetupWorker: markRaw(defineAsyncComponent(() => import('./workers/SetupWorker.vue'))),
  TeardownWorker: markRaw(defineAsyncComponent(() => import('./workers/TeardownWorker.vue'))),
  SetupDebuger: markRaw(defineAsyncComponent(() => import('./workers/SetupDebuger.vue'))),
  TeardownDebuger: markRaw(defineAsyncComponent(() => import('./workers/TeardownDebuger.vue'))),
  // sampler
  HTTPSampler: markRaw(defineAsyncComponent(() => import('./samplers/http-sampler/HttpSampler.vue'))),
  PythonSampler: markRaw(defineAsyncComponent(() => import('./samplers/PythonSampler.vue'))),
  SQLSampler: markRaw(defineAsyncComponent(() => import('./samplers/SQLSampler.vue'))),
  SnippetSampler: markRaw(defineAsyncComponent(() => import('./samplers/snippet-sampler/SnippetSampler.vue'))),
  // controller
  IfController: markRaw(defineAsyncComponent(() => import('./controllers/IfController.vue'))),
  WhileController: markRaw(defineAsyncComponent(() => import('./controllers/WhileController.vue'))),
  ForeachController: markRaw(defineAsyncComponent(() => import('./controllers/ForeachController.vue'))),
  LoopController: markRaw(defineAsyncComponent(() => import('./controllers/LoopController.vue'))),
  RetryController: markRaw(defineAsyncComponent(() => import('./controllers/RetryController.vue'))),
  TransactionController: markRaw(defineAsyncComponent(() => import('./controllers/TransactionController.vue'))),
  // config
  VariableDataset: markRaw(defineAsyncComponent(() => import('./configs/VariableDatasetConfig.vue'))),
  HttpHeadersTemplate: markRaw(defineAsyncComponent(() => import('./configs/HttpheaderTemplateConfig.vue'))),
  DatabaseEngine: markRaw(defineAsyncComponent(() => import('./configs/DatabaseEngineConfig.vue'))),
  // timer
  ConstantTimer: markRaw(defineAsyncComponent(() => import('./timers/ConstantTimer.vue'))),
  // others
  WorkspaceComponents: markRaw(defineAsyncComponent(() => import('./workspace/WorkspaceComponents.vue')))
})

const pymeterStore = usePyMeterStore()
const activeTab = computed(() => {
  let tab = pymeterStore.tabs.filter((tab) => tab.editorNo === pymeterStore.activeTabNo)[0]
  if (!tab) tab = { editorComponent: '' }
  return tab
})
const keepAliveRef = ref()

/**
 * el-tab handler
 */
const handleTabRemove = (tabNo) => {
  pymeterStore.removeTab({ editorNo: tabNo })
}

watch(keepAliveRef, (val) => {
  // 将 keepalive 实例存储至 store
  pymeterStore.keepAlive = val
})

onMounted(() => {
  // 注册快捷键
  Mousetrap.bind('mod+k', () => {
    pymeterStore.removeTab({ editorNo: pymeterStore.activeTabNo })
    return false
  })
})
onBeforeUnmount(() => {
  // 移除快捷键
  Mousetrap.unbind('mod+k')
})
</script>

<style lang="scss" scoped>
.el-card {
  display: flex;
  flex: 1;
  flex-direction: column;
}

:deep(.el-card__body) {
  display: flex;
  flex: 1;
  flex-direction: column;

  padding: 0;
  overflow: auto;
}

:deep(.el-tabs__header) {
  margin: 0 0 10px;
}

:deep(.el-tabs__item) {
  user-select: none;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border-top: none;

  &:first-child {
    border-left: none;
  }
}
</style>

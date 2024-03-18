<template>
  <el-drawer class="pymeter-footer__main-drawer" direction="btt" :size="drawerSize" :show-close="false">
    <template #header>
      <div class="drawer-title">
        <div class="l-container">
          <!-- 响应结果按钮 -->
          <el-button type="primary" plain @click="pymeterStore.toggleResultView">
            <SvgIcon icon-name="pymeter-result" style="margin-right: 5px" />
            <span>响应结果</span>
          </el-button>
          <!-- 运行日志按钮 -->
          <el-button type="primary" plain @click="pymeterStore.toggleLogView">
            <SvgIcon icon-name="pymeter-log" style="margin-right: 5px" />
            <span>运行日志</span>
          </el-button>
          <el-divider direction="vertical" style="margin-right: 20px" />
          <!-- 清空所有按钮 -->
          <el-tooltip placement="top" effect="light" :hide-after="0">
            <template #content>
              <div style="color: var(--el-text-color-regular)">清空所有</div>
            </template>
            <el-button type="danger" plain circle @click="clearAll">
              <SvgIcon icon-name="pymeter-broom-all" style="font-size: 16px" />
            </el-button>
          </el-tooltip>
        </div>
        <div class="r-container">
          <!-- 清空当前面板数据按钮 -->
          <el-tooltip placement="top" effect="light" :hide-after="0">
            <template #content>
              <div style="color: var(--el-text-color-regular)">清空当前面板数据</div>
            </template>
            <el-button type="danger" plain circle @click="clearCurrent">
              <SvgIcon icon-name="pymeter-broom" style="font-size: 16px" />
            </el-button>
          </el-tooltip>
          <!-- 切换窗口小大按钮 -->
          <el-button link class="operation-button" @click="toggleDrawerSize">
            <SvgIcon v-if="isMaxSize" icon-name="common-arrow-down-bold" />
            <SvgIcon v-else icon-name="common-arrow-up-bold" />
          </el-button>
          <!-- 关闭按钮 -->
          <el-button link class="operation-button">
            <SvgIcon icon-name="common-close" @click="pymeterStore.closeFooterDrawer" />
          </el-button>
        </div>
      </div>
      <el-divider />
    </template>

    <ResultView v-if="showResultView" v-model:data="results" />
    <LogView v-if="showlogView" v-model:data="logs" />
  </el-drawer>
</template>

<script setup>
import { ElMessage } from 'element-plus'

import LogView from './log-view/LogView.vue'
import ResultView from './result-view/ResultView.vue'

import { usePyMeterStore } from '@/store/pymeter'
import { usePymeterSocketStore } from '@/store/pymeter-socket'

const pymeterStore = usePyMeterStore()
const pymeterSocketStore = usePymeterSocketStore()
const drawerSize = ref('65%')
const isMaxSize = computed(() => drawerSize.value === '100%')
const results = inject('results', null)
const logs = inject('logs', null)
const showResultView = computed(() => pymeterStore.activeFooterViewer === 'RESULT')
const showlogView = computed(() => pymeterStore.activeFooterViewer === 'LOG')
/**
 * 清空所有记录
 */
const clearAll = () => {
  pymeterStore.closeFooterDrawer()
  if (results.value.length > 0) {
    pymeterSocketStore.cancelExecuting()
  }
  results.value = []
  logs.value = []
  ElMessage({ message: '已清空所有记录', type: 'info', duration: 1 * 1000 })
}

const clearCurrent = () => {
  if (showResultView.value) {
    if (results.value.length > 0) {
      pymeterSocketStore.cancelExecuting()
    }
    results.value = []
    return
  }
  if (showlogView.value) {
    logs.value = []
    return
  }
}

/**
 * 切换窗口大小
 */
const toggleDrawerSize = () => {
  drawerSize.value = drawerSize.value === '100%' ? '65%' : '100%'
}
</script>

<style lang="scss" scoped>
.drawer-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 5px 20px;
}

.l-container .el-button {
  margin-right: 20px;
}

.operation-button {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}
</style>

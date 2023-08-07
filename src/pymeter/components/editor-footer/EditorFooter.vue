<template>
  <el-card shadow="hover">
    <div class="l-container">
      <!-- 响应结果 -->
      <el-button type="primary" plain @click="pymeterStore.toggleResultView">
        <SvgIcon icon-name="pymeter-result" style="margin-right: 5px" />
        <span>响应结果</span>
      </el-button>
      <!-- 运行日志 -->
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
        <el-button type="danger" plain circle @click="clearAll()">
          <SvgIcon icon-name="pymeter-broom-all" style="font-size: 16px" />
        </el-button>
      </el-tooltip>
    </div>

    <div class="r-container">
      <!-- 预留 -->
    </div>

    <!-- 主抽屉窗口 -->
    <MainDrawer v-model="pymeterStore.showingFooterDrawer"></MainDrawer>
  </el-card>
</template>

<script setup>
import { assign } from 'lodash-es'
import { ElMessage, ElNotification } from 'element-plus'
import { usePyMeterStore } from '@/store/pymeter'
import useSocket from '@/composables/useSocket'
import useSocketIO from '@/composables/useSocketIO'
import MainDrawer from './MainDrawer.vue'

const socket = useSocket()
const socketio = useSocketIO()
const pymeterStore = usePyMeterStore()

const results = ref([])
const logs = ref([])

provide('results', results)
provide('logs', logs)

onBeforeMount(() => {
  socket.on('pymeter:start', (data) => {
    ElNotification.success({ message: '开始执行脚本', duration: 2 * 1000 })
    results.value.push(data)
  })
  socket.on('pymeter:result_summary', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (result) {
      assign(result, data.result)
    } else {
      results.value.push(data.result)
    }
  })
  socket.on('pymeter:worker_result', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (!result) return

    const worker = result.details.find((worker) => worker.id === data.workerId)
    if (worker) {
      assign(worker, data.worker)
    } else {
      result.details.push(data.worker)
    }
  })
  socket.on('pymeter:sampler_result', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (!result) return

    const worker = result.details.find((worker) => worker.id === data.workerId)
    if (!worker) return

    worker.children.push(data.sampler)
  })
  socket.on('pymeter:message', (data) => {
    ElNotification.info({ message: data, duration: 2 * 1000 })
  })
  socket.on('pymeter:log', (data) => {
    logs.value.push(data)
  })
  socket.on('pymeter:completed', () => {
    socketio.disconnect()
    ElNotification.success({ message: '脚本执行完成', duration: 2 * 1000 })
  })
  socket.on('pymeter:error', (data) => {
    socketio.disconnect()
    ElNotification.error({ message: data, duration: 2 * 1000 })
  })
  socket.on('pymeter:user_interrupted', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (result) {
      assign(result, data.result)
    }
    socketio.disconnect()
    ElNotification.info({ message: '取消执行成功', duration: 2 * 1000 })
  })
})

onBeforeUnmount(() => {
  socket.off('pymeter:start')
  socket.off('pymeter:result_summary')
  socket.off('pymeter:worker_result')
  socket.off('pymeter:sampler_result')
  socket.off('pymeter:message')
  socket.off('pymeter:log')
  socket.off('pymeter:completed')
  socket.off('pymeter:error')
  socket.off('pymeter:user_interrupted')
  socketio.disconnect()
})

/**
 * 清空所有记录
 */
const clearAll = () => {
  results.value = []
  logs.value = []
  ElMessage({ message: '已清空所有记录', type: 'info', duration: 1 * 1000 })
}
</script>

<style lang="scss" scoped>
:deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 5px 20px;
  width: 100%;
  min-height: 30px;
}

.l-container .el-button {
  margin-right: 20px;
}
</style>

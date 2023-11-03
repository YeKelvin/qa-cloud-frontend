import * as ExecutionService from '@/api/script/execution'
import { isEmpty } from 'lodash-es'
import { ElMessageBox } from 'element-plus'
import { usePyMeterDB } from '@/store/pymeter-db'
import { usePyMeterStore } from '@/store/pymeter'
import useSocketIO from '@/composables/useSocketIO'

export default function useRunnableElement() {
  const socketio = useSocketIO()
  const pymeterDB = usePyMeterDB()
  const pymeterStore = usePyMeterStore()

  const getOfflineData = (rootNo) => {
    const offlines = []
    pymeterDB.offlineDB.iterate((offline) => {
      if ('rootNo' in offline.meta) {
        offline.meta.rootNo === rootNo && offlines.push(offline.data)
      } else {
        offlines.push(offline.data)
      }
    })
    return offlines
  }

  /**
   * 没有选择变量集时给出提示
   */
  const popupNoDatasetTips = async () => {
    if (isEmpty(pymeterStore.selectedDatasets)) {
      await ElMessageBox.confirm('当前没有选择[环境/变量]，确定执行吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    }
  }

  /**
   * 根据 collectionNo 执行脚本
   */
  const executeTestCollection = async (elementNo) => {
    try {
      // 没有选择变量集时给出提示
      if (isEmpty(pymeterStore.selectedDatasets)) {
        await ElMessageBox.confirm('当前没有选择[环境/变量]，确定执行吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      }
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.executeCollection({
        socketId: sid,
        collectionNo: elementNo,
        datasets: pymeterStore.selectedDatasets,
        useCurrentValue: pymeterStore.useCurrentValue
      })
      // 打开结果面板
      pymeterStore.openResultDrawer()
    } catch {
      // 异常时断开 socket 连接
      socketio.disconnect()
    }
  }

  /**
   * 根据 collectionNo 执行片段
   */
  const executeTestSnippet = async (elementNo, addition) => {
    try {
      // 没有选择变量集时给出提示
      if (isEmpty(pymeterStore.selectedDatasets)) {
        await ElMessageBox.confirm('当前没有选择[环境/变量]，确定执行吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      }
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.executeSnippet({
        socketId: sid,
        snippetNo: elementNo,
        datasets: pymeterStore.selectedDatasets,
        variables: addition,
        useCurrentValue: pymeterStore.useCurrentValue
      })
      // 打开结果面板
      pymeterStore.openResultDrawer()
    } catch {
      // 异常时断开 socket 连接
      socketio.disconnect()
    }
  }

  /**
   * 根据 workerNo 执行脚本
   */
  const executeTestWorker = async (elementNo) => {
    try {
      // 没有选择变量集时给出提示
      if (isEmpty(pymeterStore.selectedDatasets)) {
        await ElMessageBox.confirm('当前没有选择[环境/变量]，确定执行吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      }
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.executeWorker({
        socketId: sid,
        workerNo: elementNo,
        datasets: pymeterStore.selectedDatasets,
        useCurrentValue: pymeterStore.useCurrentValue
      })
      // 打开结果面板
      pymeterStore.openResultDrawer()
    } catch {
      // 异常时断开 socket 连接
      socketio.disconnect()
    }
  }

  /**
   * 根据 samplerNo 执行脚本
   */
  const executeSampler = async (rootNo, elementNo) => {
    try {
      // 没有选择变量集时给出提示
      await popupNoDatasetTips()
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.executeSampler({
        samplerNo: elementNo,
        socketId: sid,
        offlines: getOfflineData(rootNo),
        datasets: pymeterStore.selectedDatasets,
        useCurrentValue: pymeterStore.useCurrentValue
      })
      // 打开结果面板
      pymeterStore.openResultDrawer()
    } catch {
      // 异常时断开 socket 连接
      socketio.disconnect()
    }
  }

  return {
    executeTestCollection,
    executeTestSnippet,
    executeTestWorker,
    executeSampler
  }
}

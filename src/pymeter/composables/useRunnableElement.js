import * as ExecutionService from '@/api/script/execution'
import { isEmpty } from 'lodash-es'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePyMeterDB } from '@/store/pymeter-db'
import { usePyMeterStore } from '@/store/pymeter'
import useSocketIO from '@/composables/useSocketIO'

export default function useRunnableElement() {
  const socketio = useSocketIO()
  const pymeterDB = usePyMeterDB()
  const pymeterStore = usePyMeterStore()

  const getOfflineData = async (rootNo) => {
    const offlines = new Map()
    await pymeterDB.offlineDB.iterate((offline, key) => {
      if ('rootNo' in offline.meta) {
        offline.meta.rootNo === rootNo && offlines.set(offline.meta.sn || key, offline.data)
      } else {
        offlines.set(offline.meta.sn || key, offline.data)
      }
    })
    return Object.fromEntries(offlines)
  }

  /**
   * 没有选择变量集时给出提示
   */
  const confirmWithoutDataset = async () => {
    if (isEmpty(pymeterStore.selectedDatasets)) {
      await ElMessageBox.confirm('当前没有选择[环境/变量]，是否确定执行？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    }
  }

  /**
   * 运行集合
   */
  const runTestCollection = async (collectionNo) => {
    try {
      // 没有选择变量集时给出提示
      await confirmWithoutDataset()
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.runCollection({
        socketId: sid,
        collectionNo: collectionNo,
        offlines: await getOfflineData(collectionNo),
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
   * 运行片段
   */
  const runTestSnippet = async (snippetNo, addition) => {
    try {
      // 没有选择变量集时给出提示
      await confirmWithoutDataset()
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.runSnippet({
        socketId: sid,
        snippetNo: snippetNo,
        offlines: await getOfflineData(snippetNo),
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
   * 运行用例
   */
  const runWorker = async (rootNo, elementNo) => {
    try {
      if (isEmpty(rootNo)) {
        ElMessage({ message: '根元素编号不能为空', type: 'error', duration: 2 * 1000 })
        return
      }
      // 没有选择变量集时给出提示
      await confirmWithoutDataset()
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.runWorker({
        socketId: sid,
        workerNo: elementNo,
        offlines: await getOfflineData(rootNo),
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
   * 运行请求
   */
  const runSampler = async (rootNo, elementNo) => {
    if (isEmpty(rootNo)) {
      ElMessage({ message: '根元素编号不能为空', type: 'error', duration: 2 * 1000 })
      return
    }
    try {
      // 没有选择变量集时给出提示
      await confirmWithoutDataset()
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.runSampler({
        samplerNo: elementNo,
        socketId: sid,
        offlines: await getOfflineData(rootNo),
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
   * 运行离线请求
   */
  const runOffline = async (rootNo, parentNo, offlineNo) => {
    if (isEmpty(rootNo)) {
      ElMessage({ message: '根元素编号不能为空', type: 'error', duration: 2 * 1000 })
      return
    }
    try {
      // 没有选择变量集时给出提示
      await confirmWithoutDataset()
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.runOffline({
        rootNo: rootNo,
        parentNo: parentNo,
        offlineNo: offlineNo,
        offlines: await getOfflineData(rootNo),
        socketId: sid,
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
    runTestCollection,
    runTestSnippet,
    runWorker,
    runSampler,
    runOffline
  }
}

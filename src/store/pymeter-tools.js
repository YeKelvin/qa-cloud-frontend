import { usePyMeterDB } from '@/store/pymeter-db'
import { isEmpty } from 'lodash-es'

/**
 * 移除 keepalive 缓存
 */
export const removeCache = (keepAlive, cacheKey) => {
  if (!keepAlive) return
  const keepAliveComponent = keepAlive.$
  const cacheMap = keepAliveComponent.__v_cache
  const cachedVnode = cacheMap.get(cacheKey)
  if (cachedVnode) {
    const COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8
    const COMPONENT_KEPT_ALIVE = 1 << 9
    let shapeFlag = cachedVnode.shapeFlag
    if (shapeFlag & COMPONENT_SHOULD_KEEP_ALIVE) {
      shapeFlag -= COMPONENT_SHOULD_KEEP_ALIVE
    }
    if (shapeFlag & COMPONENT_KEPT_ALIVE) {
      shapeFlag -= COMPONENT_KEPT_ALIVE
    }
    cachedVnode.shapeFlag = shapeFlag
    const keepAliveRenderer = keepAliveComponent.proxy.renderer
    keepAliveRenderer.um(cachedVnode, keepAliveComponent, keepAliveComponent.suspense, false, false)
    cacheMap.delete(cacheKey)
  }
}

/**
 * tab关闭二次确认窗口
 */
export const confirmClose = async (tab) => {
  if (!tab.unsaved) return
  try {
    // 二次确认窗口
    await ElMessageBox.confirm('脚本数据未保存，是否保存并关闭 ?', '警告', {
      confirmButtonText: '保存关闭',
      cancelButtonText: '放弃变更',
      type: 'warning',
      distinguishCancelAndClose: true
    })
    // 标识正在关闭，组件监听到正在关闭时就会保存数据
    tab.closing = true
    // 等待保存成功
    await waitingSaved(tab)
  } catch (error) {
    // 表示保存失败
    if (error.message === 'fail') return true
    // 表示用户取消
    if (error === 'close') return true
    // 丢弃离线数据
    if (error === 'cancel') return await confirmDiscard(isEmpty(tab.metadata.sn) ? tab.editorNo : tab.metadata.sn)
  }
}

const confirmDiscard = async (offlineKey) => {
  try {
    // 二次确认窗口
    await ElMessageBox.confirm('脚本数据未保存，是否确定放弃变更 ?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 丢弃离线数据
    await usePyMeterDB().remove(offlineKey)
  } catch (error) {
    // 表示用户取消
    return true
  }
}

const waitingSaved = (tab) => {
  let timeoutId = null
  let intervalId = null

  return new Promise((resolve, reject) => {
    if (!tab.unsaved) resolve()

    timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      ElMessage({ message: '保存超时，请重试!', type: 'error', duration: 2 * 1000 })
      reject(new Error('fail'))
    }, 5000)

    intervalId = setInterval(() => {
      if (!tab.unsaved) {
        clearInterval(intervalId)
        clearTimeout(timeoutId)
        resolve()
      }
    }, 200)
  })
}

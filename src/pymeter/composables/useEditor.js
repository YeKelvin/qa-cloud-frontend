import { usePyMeterStore } from '@/store/pymeter'
import { isEmpty } from 'lodash-es'

export default function useEditor() {
  const instance = getCurrentInstance()
  const pymeterStore = usePyMeterStore()

  const creation = computed(() => isEmpty(instance.props.metadata.sn))
  const localkey = computed(() => (creation.value ? instance.props.editorNo : instance.props.metadata.sn))

  const unsaved = computed({
    get: () => instance.props.unsaved,
    set: (val) => instance.emit('update:unsaved', val)
  })

  const metadata = computed({
    get: () => instance.props.metadata,
    set: (val) => instance.emit('update:metadata', val)
  })

  const onMacOS = computed(() => /macintosh|mac os x/i.test(navigator.userAgent))
  const shortcutKeyName = computed(() => {
    return onMacOS.value ? '⌘+S' : 'Ctrl+S'
  })

  const updateTabName = (name) => {
    pymeterStore.updateTab({
      metadata: { name: name },
      editorNo: instance.props.editorNo,
      editorName: name
    })
  }

  /**
   * 关闭 tab
   */
  const closeTab = () => {
    pymeterStore.removeTab({ editorNo: instance.props.editorNo })
  }

  /**
   * 展开父节点
   */
  const expandParentNode = () => {
    pymeterStore.pendingExpandedElementNo = metadata.value.parentNo
  }

  /**
   * 刷新侧边栏的元素列表
   */
  const refreshElementTree = () => {
    pymeterStore.refreshElementTree()
  }

  /**
   * 保存数据（快捷键）
   */
  const saveByShortcut = async (e) => {
    if (e.repeat) return
    if (e.key === 's' && (onMacOS.value ? e.metaKey : e.ctrlKey)) {
      e.preventDefault()
      unsaved.value && instance.exposed.save()
    }
  }

  /**
   * 关闭窗口（快捷键）
   */
  const closeByShortcut = async (e) => {
    if (e.repeat) return
    if (e.key === 'k' && (onMacOS.value ? e.metaKey : e.ctrlKey)) {
      e.preventDefault()
      closeTab()
    }
  }

  /** hook **/
  let container = null
  onMounted(() => {
    // 注册快捷键
    container = document.querySelector('.pymeter-component-container')
    container.addEventListener('keydown', saveByShortcut, false)
    container.addEventListener('keydown', closeByShortcut, false)
  })
  onBeforeUnmount(() => {
    // 移除快捷键
    container.removeEventListener('keydown', saveByShortcut, false)
    container.removeEventListener('keydown', closeByShortcut, false)
  })
  watch(
    () => instance.props.closing,
    (closing) => closing && instance.exposed.save(),
    { flush: 'sync' }
  )

  return {
    unsaved,
    metadata,
    creation,
    localkey,
    shortcutKeyName,
    closeTab,
    updateTabName,
    expandParentNode,
    refreshElementTree
  }
}

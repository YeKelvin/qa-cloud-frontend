import { usePyMeterStore } from '@/store/pymeter'
import { isEmpty } from 'lodash-es'

export default function useEditor() {
  const instance = getCurrentInstance()
  const pymeterStore = usePyMeterStore()

  const creation = computed(() => isEmpty(instance.props.metadata.sn))
  const localkey = computed(() => (creation.value ? instance.props.editorNo : instance.props.metadata.sn))

  const { editorNo, editorMode } = toRefs(instance.props) // TODO: delete
  const editMode = ref(editorMode.value) // TODO: delete
  const queryMode = computed(() => editMode.value === 'QUERY') // TODO: delete
  const modifyMode = computed(() => editMode.value === 'MODIFY') // TODO: delete
  const createMode = computed(() => editMode.value === 'CREATE') // TODO: delete

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

  const functions = reactive({}) // TODO: delete

  /**
   * 开启编辑模式
   */
  const editNow = () => {
    editMode.value = 'MODIFY' // TODO: delete
  }

  /**
   * 设为只读模式
   */
  const setReadonly = () => {
    editMode.value = 'QUERY' // TODO: delete
  }

  /**
   * 更新 tab
   */
  const updateTab = (name, number = null) => {
    // TODO: delete
    pymeterStore.updateTab({
      editorNo: editorNo.value,
      editorName: name,
      metadata: number ? { sn: number, elementNo: number } : null
    })
  }

  const updateTabName = (name) => {
    pymeterStore.updateTab({
      editorNo: editorNo.value,
      editorName: name,
      metadata: {
        name: name
      }
    })
  }

  const updateTabMetadata = (metadata) => {
    pymeterStore.updateTab({
      editorNo: editorNo.value,
      metadata: metadata
    })
  }

  /**
   * 关闭 tab
   */
  const closeTab = () => {
    pymeterStore.removeTab({ editorNo: editorNo.value })
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
    editMode,
    queryMode,
    modifyMode,
    createMode,
    functions,
    editNow,
    setReadonly,
    updateTab,
    closeTab,
    updateTabName,
    updateTabMetadata,
    expandParentNode,
    refreshElementTree
  }
}

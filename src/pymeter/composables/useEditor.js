import { usePyMeterStore } from '@/store/pymeter'
import useOS from '@/composables/useOS'

export default function useEditor(props) {
  const { isMacOS } = useOS()
  const pymeterStore = usePyMeterStore()

  const { editorNo, editorMode, metadata } = toRefs(props)
  const editMode = ref(editorMode.value)
  const queryMode = computed(() => editMode.value === 'QUERY')
  const modifyMode = computed(() => editMode.value === 'MODIFY')
  const createMode = computed(() => editMode.value === 'CREATE')

  const functions = reactive({})

  /**
   * 开启编辑模式
   */
  const editNow = () => {
    editMode.value = 'MODIFY'
  }

  /**
   * 设为只读模式
   */
  const setReadonly = () => {
    editMode.value = 'QUERY'
  }

  /**
   * 更新 tab
   */
  const updateTab = (name, sn = null) => {
    pymeterStore.updateTab({
      editorNo: editorNo.value,
      editorName: name,
      realNo: sn
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
   * 开启编辑模式（快捷键）
   */
  const editNowByShortcut = async (e) => {
    if (e.repeat) return
    if (e.key == 'e' && (isMacOS ? e.metaKey : e.ctrlKey)) {
      e.preventDefault()
      if (!queryMode.value) return
      editNow()
    }
  }

  /**
   * 提交新增或修改（快捷键）
   */
  const submitByShortcut = async (e) => {
    if (e.repeat) return
    if (e.key == 's' && (isMacOS ? e.metaKey : e.ctrlKey)) {
      e.preventDefault()
      if (queryMode.value) return
      if (createMode.value) {
        functions.createFn()
      } else {
        functions.modifyFn()
      }
    }
  }

  /**
   * 关闭窗口（快捷键）
   */
  const closeByShortcut = async (e) => {
    if (e.repeat) return
    if (e.key == 'k' && (isMacOS ? e.metaKey : e.ctrlKey)) {
      e.preventDefault()
      closeTab()
    }
  }

  /** hook **/
  let container = null
  onMounted(() => {
    // 注册快捷键
    container = document.querySelector('.pymeter-component-container')
    container.addEventListener('keydown', editNowByShortcut, false)
    container.addEventListener('keydown', submitByShortcut, false)
    container.addEventListener('keydown', closeByShortcut, false)
  })
  onBeforeUnmount(() => {
    // 移除快捷键
    container.removeEventListener('keydown', editNowByShortcut, false)
    container.removeEventListener('keydown', submitByShortcut, false)
    container.removeEventListener('keydown', closeByShortcut, false)
  })

  return {
    editMode,
    queryMode,
    modifyMode,
    createMode,
    functions,
    editNow,
    setReadonly,
    updateTab,
    closeTab,
    expandParentNode,
    refreshElementTree
  }
}

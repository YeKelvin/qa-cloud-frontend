<template>
  <el-tree
    ref="eltreeRef"
    node-key="elementNo"
    style="padding-bottom: 100px"
    :indent="36"
    :data="elementList"
    :expand-on-click-node="false"
    :default-expanded-keys="expandedList"
    :props="{ label: 'elementName', children: 'children' }"
    :allow-drag="allowDrag"
    :allow-drop="allowDrop"
    highlight-current
    draggable
    @node-click="handleNodeClick"
    @node-expand="handleNodeExpand"
    @node-collapse="handleNodeCollapse"
    @node-drop="handleNodeDrop"
  >
    <!-- 元素节点 -->
    <template #default="{ node, data }">
      <span class="tree-item" @mouseenter="treeNodeMouseenter(node)" @mouseleave="treeNodeMouseleave()">
        <!-- 元素名称 -->
        <ElementTreeItemName :data="data" @dblclick="handleNodeDBClick(node)" />
        <!-- 操作菜单按钮 -->
        <span v-show="hoveredNode === node" @mouseenter="triggerButtonMouseenter" @click.stop="operatingNode = node">
          <el-button type="primary" link :icon="More" />
        </span>
      </span>
    </template>
  </el-tree>

  <!-- 元素操作菜单 -->
  <ElementTreeItemMenu
    v-model:visible="menuVisible"
    :placement="menuPlacement"
    :virtual-ref="menuTriggerButtonRef"
    :node="operatingNode"
    @hide="handleMenuHide"
  />
</template>

<script lang="jsx" setup>
import * as ElementService from '@/api/script/element'
import { isEmpty, debounce } from 'lodash-es'
import { More } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePyMeterStore } from '@/store/pymeter'
import useElTree from '@/composables/useElTree'
import ElementTreeItemName from './ElementTreeItemName.vue'
import ElementTreeItemMenu from './ElementTreeItemMenu.vue'
import { nextTick } from 'vue'

let clickTimer = null
const pymeterStore = usePyMeterStore()
const props = defineProps({
  collections: { type: Array, default: () => [] }
})
const elementList = ref([])
const pendingPaste = ref(null)
const isMacOS = computed(() => /macintosh|mac os x/i.test(navigator.userAgent))
const {
  eltreeRef,
  expandedList,
  hoveredNode,
  menuVisible,
  menuPlacement,
  menuTriggerButtonRef,
  operatingNode,
  treeNodeMouseenter,
  treeNodeMouseleave,
  triggerButtonMouseenter,
  handleMenuHide,
  getRootNode,
  handleNodeExpand,
  handleNodeCollapse,
  expandAll,
  expandNode,
  toggleNodeExpanded
} = useElTree()

watch(
  () => pymeterStore.refreshElementTreeFlag,
  () => queryElementsTree()
)
watch(
  () => pymeterStore.pendingExpandedElementNo,
  (val) => {
    const node = eltreeRef.value.getNode(val)
    if (!node) return
    node.expanded = true
    expandedList.value.push(val)
  }
)
watch(
  () => props.collections,
  (val) => {
    if (!val) return
    queryElementsTree()
  },
  { deep: true }
)

onMounted(() => {
  if (!isEmpty(props.collections)) queryElementsTree(true)
  // 根据操作系统动态绑定快捷键
  const eltreeDom = eltreeRef.value.$el
  eltreeDom.addEventListener('keydown', cutByShortcut, false)
  eltreeDom.addEventListener('keydown', copyByShortcut, false)
  eltreeDom.addEventListener('keydown', pasteByShortcut, false)
  eltreeDom.addEventListener('keydown', duplicateByShortcut, false)
  eltreeDom.addEventListener('keydown', toggleStateByShortcut, false)
  eltreeDom.addEventListener('keydown', deleteByShortcut, false)
})

onBeforeUnmount(() => {
  // 移除快捷键
  const eltreeDom = eltreeRef.value.$el
  eltreeDom.removeEventListener('keydown', cutByShortcut, false)
  eltreeDom.removeEventListener('keydown', copyByShortcut, false)
  eltreeDom.removeEventListener('keydown', pasteByShortcut, false)
  eltreeDom.removeEventListener('keydown', duplicateByShortcut, false)
  eltreeDom.removeEventListener('keydown', toggleStateByShortcut, false)
  eltreeDom.removeEventListener('keydown', deleteByShortcut, false)
})

/**
 * 查询脚本列表
 */
const queryElementsTree = (expandtop = false) => {
  if (isEmpty(props.collections)) {
    elementList.value = []
    return
  }
  // 根据列表查询元素及其子代
  ElementService.queryElementsChildren({ elements: props.collections }).then((response) => {
    // 存储列表
    elementList.value = response.result
    // 自动展开顶级节点
    expandtop && elementList.value.forEach((item) => expandedList.value.push(item.elementNo))
    // 顶级节点添加 padding-bottom: 10px
    nextTick(() => elementList.value.forEach((item) => addTreeNodePaddingBottom(item.elementNo)))
  })
}

const addTreeNodePaddingBottom = (collectionNo) => {
  if (!eltreeRef.value) return
  const treenode = eltreeRef.value.$el.querySelector(`.el-tree-node[data-key="${collectionNo}"]`)
  if (!treenode) return
  treenode.style['padding-bottom'] = '10px'
}

/**
 * el-tree handler
 */
const handleNodeClick = (data) => {
  clearTimeout(clickTimer) //清除计时器
  clickTimer = setTimeout(() => {
    pymeterStore.addTab({
      editorNo: data.elementNo,
      editorName: data.elementName,
      editorComponent: data.elementClass,
      editorMode: 'QUERY',
      metadata: {
        rootNo: data.rootNo,
        parentNo: data.elementNo
      }
    })
  }, 200)
}

/**
 * el-tree handler
 */
const handleNodeDBClick = (node) => {
  clearTimeout(clickTimer) //清除计时器
  toggleNodeExpanded(node)
}

/**
 * 拖拽成功完成时触发的事件
 */
const handleNodeDrop = (draggingNode, dropNode, dropType) => {
  let targetParentNo = 0
  let targetSortNo = 0

  // 跨脚本拖曳
  const over = draggingNode.data.rootNo !== dropNode.data.rootNo
  // 移动的方向
  let moveDirection = draggingNode.data.sortNo > dropNode.data.sortNo ? 'UP' : 'DOWN'
  if (over) {
    moveDirection = 'UP'
  }

  switch (dropType) {
    case 'inner':
      targetParentNo = dropNode.data.elementNo
      targetSortNo = dropNode.childNodes.length
      break
    case 'before':
      targetParentNo = dropNode.parent.data.elementNo
      targetSortNo = moveDirection === 'UP' ? dropNode.data.sortNo : dropNode.data.sortNo - 1
      break
    case 'after':
      targetParentNo = dropNode.parent.data.elementNo
      targetSortNo = moveDirection === 'UP' ? dropNode.data.sortNo + 1 : dropNode.data.sortNo
      break
    default:
      return
  }

  ElementService.moveElement({
    sourceNo: draggingNode.data.elementNo,
    targetRootNo: dropNode.data.rootNo,
    targetParentNo: targetParentNo,
    targetSortNo: targetSortNo
  }).then(() => {
    queryElementsTree()
  })
}

/**
 * 判断节点能否被拖拽
 * @param {*} draggingNode 拖曳的节点
 */
const allowDrag = (draggingNode) => {
  // Collection 不允许拖拽
  if (draggingNode.data.elementType === 'COLLECTION') return false
  return true
}

/**
 * 拖拽时判定目标节点能否被放置
 * @param {*} draggingNode 拖曳的节点
 * @param {*} dropNode 目标节点
 * @param {*} type 放置类型
 */
const allowDrop = (draggingNode, dropNode, type) => {
  // Element 只允许在 Collection 里插入，不允许在 Collection 前后放置
  if (dropNode.data.elementType === 'COLLECTION' && (type === 'prev' || type === 'next')) return false

  // 拖拽 Worker
  if (draggingNode.data.elementType === 'WORKER') {
    // Worker 只允许同级排序 或 在 Collection 里插入
    if (!['COLLECTION', 'WORKER'].includes(dropNode.data.elementType)) return false
    // Worker 只允许在 Worker 前后放置，不允许在 Worker 里插入
    if (dropNode.data.elementType === 'WORKER' && type === 'inner') return false
  }

  // 拖拽 Controller
  if (draggingNode.data.elementType === 'CONTROLLER') {
    // Controller 不允许在 TestCollection 前后放置和插入
    if (dropNode.data.elementClass === 'TestCollection') return false
    // Controller 只允许在 Worker 里插入，不允许在 Worker 前后放置
    if (dropNode.data.elementType === 'WORKER' && (type === 'prev' || type === 'next')) return false
    // Controller 只允许在以下元素类型的前后放置，不允许在元素里插入
    if (
      ['SAMPLER', 'CONFIG', 'TIMER', 'PRE_PROCESSOR', 'POST_PROCESSOR', 'ASSERTION', 'LISTENER'].includes(
        dropNode.data.elementType
      ) &&
      type === 'inner'
    )
      return false
    // Controller 只允许在父级类型为 WORKER 或 CONTROLLER 前后放置
    if (['WORKER', 'CONTROLLER'].includes(dropNode.parent.data.elementType) && type === 'inner') return false
  }

  // TestCollection
  const dropRootNode = getRootNode(dropNode)
  if (dropRootNode && dropRootNode.data.elementClass === 'TestCollection') {
    // 拖拽 Sampler
    if (draggingNode.data.elementType === 'SAMPLER') {
      // Sampler 不允许在 TestCollection 前后放置和插入
      if (dropNode.data.elementClass === 'TestCollection') return false
      // Sampler 只允许在 Worker 里插入，不允许在 Worker 前后放置
      if (dropNode.data.elementType === 'WORKER' && (type === 'prev' || type === 'next')) return false
      // Sampler 只允许在以下元素类型的前后放置，不允许在向里插入
      if (
        ['SAMPLER', 'CONFIG', 'TIMER', 'PRE_PROCESSOR', 'POST_PROCESSOR', 'ASSERTION', 'LISTENER'].includes(
          dropNode.data.elementType
        ) &&
        type === 'inner'
      )
        return false
      // Sampler 前后放置时，不允许移动到父级类型为 Sampler 的前后
      if (dropNode.parent.data.elementType === 'SAMPLER' && (type === 'prev' || type === 'next')) return false
    }
  }

  // 除以上规则不允许拖动排序，其余均允许
  return true
}

/**
 * 通过快捷键剪切元素至剪贴板
 */
const cutByShortcut = (e) => {
  if (e.repeat) return
  if (e.key == 'x' && (isMacOS ? e.metaKey : e.ctrlKey)) {
    e.preventDefault() // 阻止浏览器默认快捷键
    // 获取当前节点数据
    const data = eltreeRef.value.getCurrentNode()
    if (data.elementType === 'COLLECTION') return
    pendingPaste.value = { ...data, pasteType: 'CUT' }
    ElMessage({ message: '已剪切到剪贴板', type: 'info', duration: 1 * 1000 })
  }
}

/**
 * 通过快捷键复制元素至剪贴板
 */
const copyByShortcut = (e) => {
  if (e.repeat) return
  if (e.key == 'c' && (isMacOS ? e.metaKey : e.ctrlKey)) {
    e.preventDefault() // 阻止浏览器默认快捷键
    // 获取当前节点数据
    const data = eltreeRef.value.getCurrentNode()
    if (data.elementType === 'COLLECTION') return
    pendingPaste.value = { ...data, pasteType: 'COPY' }
    ElMessage({ message: '已复制到剪贴板', type: 'info', duration: 1 * 1000 })
  }
}

/**
 * 粘贴元素（防抖）
 */
const debouncedPasteElement = debounce(
  () => {
    // 获取目标节点数据
    const target = eltreeRef.value.getCurrentNode()
    target &&
      ElementService.pasteElement({
        sourceNo: pendingPaste.value.elementNo,
        targetNo: target.elementNo,
        pasteType: pendingPaste.value.pasteType
      }).then(() => {
        // 清空剪贴板
        if (pendingPaste.value.pasteType === 'CUT') {
          pendingPaste.value = null
        }
        // 重新查询列表
        queryElementsTree()
        // 目标元素为集合或分组时展开元素
        if (['COLLECTION', 'WORKER'].includes(target.elementType)) {
          pymeterStore.pendingExpandedElementNo = target.elementNo
        }
        // 成功提示
        ElMessage({ message: '剪贴成功', type: 'info', duration: 2 * 1000 })
      })
  },
  1000,
  { leading: true, trailing: false }
)

/**
 * 通过快捷键粘贴元素
 */
const pasteByShortcut = (e) => {
  if (e.repeat) return
  if (e.key == 'v' && (isMacOS ? e.metaKey : e.ctrlKey)) {
    e.preventDefault()
    debouncedPasteElement()
  }
}

/**
 * 复制元素（防抖）
 */
const debouncedDuplicateElement = debounce(
  async () => {
    // 获取目标节点数据
    const target = eltreeRef.value.getCurrentNode()
    if (!target) return
    if (target.elementType === 'COLLECTION') return
    // 复制 worker 时需要二次确认
    if (target.elementType === 'WORKER' || target.elementType === 'CONTROLLER') {
      // 二次确认
      const cancelled = await ElMessageBox.confirm(null, {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        title: '警告',
        message: (
          <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
            确认复制 {target.elementName} 吗？
          </span>
        )
      })
        .then(() => false)
        .catch(() => true)
      if (cancelled) return
      // 复制元素
      await ElementService.duplicateElement({ elementNo: target.elementNo })
      // 重新查询列表
      queryElementsTree()
      // 成功提示
      ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
      return
    }
    // 非 worker 元素直接复制
    await ElementService.duplicateElement({ elementNo: target.elementNo })
    // 重新查询列表
    queryElementsTree()
    // 成功提示
    ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
  },
  1000,
  { leading: true, trailing: false }
)

/**
 * 通过快捷键复制元素
 */
const duplicateByShortcut = async (e) => {
  if (e.repeat) return
  if (e.key == 'd' && (isMacOS ? e.metaKey : e.ctrlKey)) {
    e.preventDefault()
    debouncedDuplicateElement()
  }
}

/**
 * 切换元素状态（防抖）
 */
const debouncedToggleElementState = debounce(
  () => {
    // 获取当前节点数据
    const data = eltreeRef.value.getCurrentNode()
    if (!data) return
    // 切换元素状态
    ElementService.toggleElementState({ elementNo: data.elementNo }).then(() => {
      // 重新查询列表
      queryElementsTree()
    })
  },
  1000,
  { leading: true, trailing: false }
)

/**
 * 通过快捷键切换元素状态
 */
const toggleStateByShortcut = (e) => {
  if (e.repeat) return
  if (e.key == '/' && (isMacOS ? e.metaKey : e.ctrlKey)) {
    e.preventDefault()
    debouncedToggleElementState()
  }
}

/**
 * 删除元素（防抖）
 */
const deleteElement = debounce(
  async () => {
    // 获取当前节点数据
    const data = eltreeRef.value.getCurrentNode()
    // 二次确认
    const cancelled = await ElMessageBox.confirm(null, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      title: '警告',
      message: (
        <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
          确认删除 {data.elementName} 吗？
        </span>
      )
    })
      .then(() => false)
      .catch(() => true)
    if (cancelled) return
    // 删除元素
    await ElementService.removeElement({ elementNo: data.elementNo })
    // 集合元素特殊处理
    if (data.elementType === 'COLLECTION') {
      // 从已选中的集合列表中移除该集合
      pymeterStore.removeSelectedCollection(data.elementNo)
      // 重新查询集合列表
      pymeterStore.refreshCollections()
    }
    // 关闭tab
    pymeterStore.removeTab({ editorNo: data.elementNo })
    // 重新查询列表
    queryElementsTree()
  },
  1000,
  { leading: true, trailing: false }
)

/**
 * 通过快捷键删除元素
 */
const deleteByShortcut = async (e) => {
  if (e.repeat) return
  if (e.key == 'Delete') {
    e.preventDefault()
    deleteElement()
  }
}

defineExpose({
  expandAll,
  expandNode,
  queryElementsTree
})
</script>

<style lang="scss" scoped>
.tree-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding-right: 8px;
}

:deep(.el-tree-node__content) {
  height: 100%;
  min-height: 26px;
}
</style>

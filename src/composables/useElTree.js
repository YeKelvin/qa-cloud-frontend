import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export default function useElTree() {
  const eltreeRef = ref()
  const expandedList = ref([])

  const hoveredNode = ref(null)
  const hoveredOtherNode = ref(null)

  const menuVisible = ref(false)
  const menuPlacement = ref('bottom')
  const menuTriggerButtonRef = ref()

  const currentKey = ref(null)
  const operatingNode = ref(null)

  /**
   * el-tree-node 鼠标移入事件
   */
  const treeNodeMouseenter = (node) => {
    if (menuVisible.value) {
      hoveredOtherNode.value = node
      return
    }
    hoveredNode.value = node
  }

  /**
   * el-tree-node 鼠标移出事件
   */
  const treeNodeMouseleave = () => {
    if (menuVisible.value) {
      hoveredOtherNode.value = null
      return
    }
    hoveredNode.value = null
  }

  /**
   * 元素更多按钮的鼠标移入事件
   */
  const triggerButtonMouseenter = (e) => {
    if (menuVisible.value) return
    menuTriggerButtonRef.value = e.currentTarget
    // 计算目标元素与底部的距离
    const bottomOffset =
      window.innerHeight - e.currentTarget.getBoundingClientRect().y - e.currentTarget.getBoundingClientRect().height
    // 目标元素与底部的距离小于220时，菜单向上弹出
    menuPlacement.value = bottomOffset > 220 ? 'bottom' : 'top'
  }

  /**
   * 隐藏菜单事件
   */
  const handleMenuHide = () => {
    hoveredNode.value = hoveredOtherNode.value
    operatingNode.value = null
  }

  /**
   * el-tree 获取根节点
   */
  const getRootNode = (node) => {
    if (node.level === 1) {
      return node
    }
    if (node.parent) {
      return getRootNode(node.parent)
    }
    ElMessage({ message: '根节点获取失败', type: 'error', duration: 2 * 1000 })
    return null
  }

  /**
   * el-tree展开节点的回调
   */
  const handleNodeExpand = (data) => {
    if (expandedList.value.includes(data.elementNo)) return
    expandedList.value.push(data.elementNo)
  }

  /**
   * el-tree收起节点的回调
   */
  const handleNodeCollapse = (data) => {
    expandedList.value.splice(expandedList.value.indexOf(data.elementNo), 1)
  }

  /**
   * 展开或收起所有节点
   */
  const expandAll = (expand) => {
    expandNode(eltreeRef.value.store.root, expand)
  }

  /**
   * 展开或收起节点
   */
  const expandNode = (node, expand) => {
    node.expanded = expand
    for (let i = 0; i < node.childNodes.length; i++) {
      // 改变节点的自身expanded状态
      node.childNodes[i].expanded = expand

      // 更新已展开节点列表
      if (expand) {
        handleNodeExpand(node.childNodes[i].data)
      } else {
        handleNodeCollapse(node.childNodes[i].data)
      }

      // 遍历子节点
      if (node.childNodes[i].childNodes.length > 0) {
        expandNode(node.childNodes[i], expand)
      }
    }
  }

  /**
   * el-tree 切换节点展开状态
   */
  const toggleNodeExpanded = (node) => {
    node.expanded = !node.expanded
    if (node.expanded) {
      handleNodeExpand(node.data)
    } else {
      handleNodeCollapse(node.data)
    }
  }

  return {
    eltreeRef,
    expandedList,
    hoveredNode,
    hoveredOtherNode,
    menuVisible,
    menuPlacement,
    menuTriggerButtonRef,
    currentKey,
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
  }
}

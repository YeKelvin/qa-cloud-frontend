<template>
  <el-tree
    ref="eltreeRef"
    node-key="templateNo"
    :props="{ label: 'templateName' }"
    :data="pymeterStore.httpheaderTemplateList"
    :filter-node-method="filterNode"
    @node-click="handleNodeClick"
  >
    <template #default="{ node }">
      <span class="tree-item" @mouseenter="treeNodeMouseenter(node)" @mouseleave="treeNodeMouseleave()">
        <span class="tree-item-name-wrapper">
          <!-- 变量集图标 -->
          <SvgIcon icon-name="pymeter-httpheader-template" class-name="tree-item-icon" />
          <!-- 变量集名称 -->
          <span class="tree-item-name">{{ node.label }}</span>
        </span>

        <!-- 操作菜单按钮 -->
        <span v-show="hoveredNode === node" @mouseenter="triggerButtonMouseenter" @click.stop="operatingNode = node">
          <el-button type="primary" link :icon="More" />
        </span>
      </span>
    </template>
  </el-tree>

  <!-- 操作菜单 -->
  <el-popover
    ref="elpopoverRef"
    v-model:visible="menuVisible"
    trigger="click"
    transition="el-zoom-in-top"
    popper-class="httpheader-template-menu-popover"
    virtual-triggering
    :hide-after="50"
    :placement="menuPlacement"
    :virtual-ref="menuTriggerButtonRef"
    :popper-options="{ removeOnDestroy: true }"
    @hide="handleMenuHide"
  >
    <div style="display: flex; flex-direction: column">
      <el-button link @click="renameTemplate">重命名</el-button>
      <el-button link @click="duplicateTemplate">复制</el-button>
      <el-button link @click="copyTemplateToWorkspace">复制空间</el-button>
      <el-button link @click="moveTemplateToWorkspace">移动空间</el-button>
      <el-button link @click="deleteTemplate">删除</el-button>
    </div>
  </el-popover>
</template>

<script lang="jsx" setup>
import * as HeadersService from '@/api/script/headers'
import useElTree from '@/composables/useElTree'
import NameInput from '@/pymeter/components/editor-aside/common/NameInput.vue'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'
import { usePyMeterStore } from '@/store/pymeter'
import { usePyMeterDB } from '@/store/pymeter-db'
import { useWorkspaceStore } from '@/store/workspace'
import { More } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const {
  eltreeRef,
  hoveredNode,
  menuVisible,
  menuPlacement,
  menuTriggerButtonRef,
  operatingNode,
  treeNodeMouseenter,
  treeNodeMouseleave,
  triggerButtonMouseenter,
  handleMenuHide
} = useElTree()
const offlineDB = usePyMeterDB().offlineDB
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

/**
 * 查询所有请求头模板
 */
const queryHttpheaderTemplateAll = () => {
  pymeterStore.queryHttpheaderTemplateAll()
}

/**
 * 关闭操作菜单
 */
const closeMenu = () => {
  menuVisible.value = false
}

/**
 * 重命名请求头模板
 */
const renameTemplate = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let newName = data.templateName
  // 弹出名称对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '重命名模板',
    message: <NameInput initial={newName} onUpdate:modelValue={(val) => (newName = val)} />,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 修改请求头模板
  await HeadersService.modifyHttpheaderTemplate({ templateNo: data.templateNo, templateName: newName })
  // 修改离线数据中的tab名称
  const offline = await offlineDB.getItem(data.templateNo)
  if (offline) {
    offline.meta.name = newName
    offlineDB.setItem(data.templateNo, offline)
  }
  // 重新查询列表
  queryHttpheaderTemplateAll()
  // 重命名tab
  pymeterStore.updateTab({ editorNo: data.templateNo, editorName: newName })
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制请求头模板
 */
const duplicateTemplate = async () => {
  const data = operatingNode.value.data
  closeMenu()
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
        确认复制 {data.templateName} 吗？
      </span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制请求头模板
  await HeadersService.duplicateHttpheaderTemplate({ templateNo: data.templateNo })
  //  重新查询列表
  queryHttpheaderTemplateAll()
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制请求头模板到指定空间
 */
const copyTemplateToWorkspace = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={data.templateNo}
        data={workspaceStore.workspaceList}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制请求头模板到指定空间
  await HeadersService.copyHttpheaderTemplateToWorkspace({ templateNo: data.templateNo, workspaceNo })
  //  成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 移动请求头模板到指定空间
 */
const moveTemplateToWorkspace = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={data.templateNo}
        data={workspaceStore.workspaceList}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 移动请求头模板到指定空间
  await HeadersService.moveHttpheaderTemplateToWorkspace({ templateNo: data.templateNo, workspaceNo })
  // 重新查询列表
  queryHttpheaderTemplateAll()
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 删除请求头模板
 */
const deleteTemplate = async () => {
  const data = operatingNode.value.data
  closeMenu()
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
        确认删除 {data.templateName} 吗？
      </span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除请求头模板
  await HeadersService.deleteHttpheaderTemplate({ templateNo: data.templateNo })
  // 删除离线数据
  offlineDB.removeItem(data.templateNo)
  // 关闭tab
  pymeterStore.removeTab({ editorNo: data.templateNo, force: true })
  // 重新查询列表
  queryHttpheaderTemplateAll()
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 1 * 1000 })
}

/**
 * el-tree handler
 */
const handleNodeClick = (data) => {
  pymeterStore.addTab({
    editorNo: data.templateNo,
    editorName: data.templateName,
    editorComponent: 'HttpHeadersTemplate',
    editorMode: 'QUERY',
    metadata: {
      sn: data.templateNo,
      name: data.templateName,
      component: 'HttpHeadersTemplate'
    }
  })
}

/**
 * el-tree 节点过滤
 */
const filterNode = (value, data) => {
  if (!value) return true
  return data.templateName.indexOf(value) !== -1
}

/**
 * el-tree 文本过滤
 */
const filter = (val) => {
  eltreeRef.value.filter(val)
}

defineExpose({
  filter
})
</script>

<style lang="scss">
.httpheader-template-menu-popover {
  padding: 5px 0 !important;

  .el-button {
    justify-content: flex-start;
    width: 100%;
    padding: 5px 16px;
    font-family: inherit;
    font-size: var(--el-font-size-base);
    font-weight: inherit;
    line-height: 22px;
    color: var(--el-text-color-regular);

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9) !important;
    }
  }

  .el-button + .el-button {
    margin-left: 0;
  }
}

.httpheader-template-menu--top-option > span {
  justify-content: space-between;
  width: 100%;
}

.httpheader-template-menu--shortcut-option > span {
  justify-content: space-between;
  width: 100%;
}
</style>

<style lang="scss" scoped>
.tree-item {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}

.tree-item-name-wrapper {
  display: flex;
  align-items: center;
  user-select: none;
}

.tree-item-icon {
  width: 1.8em !important;
  height: 1.8em !important;
  padding-right: 5px;
}

.tree-item-name {
  padding-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-tree-node__content) {
  height: 100%;
  min-height: 30px;
}
</style>

<template>
  <el-tree
    ref="eltreeRef"
    node-key="dbNo"
    :props="{ label: 'dbName' }"
    :data="pymeterStore.databaseEngineList"
    :filter-node-method="filterNode"
    @node-click="handleNodeClick"
  >
    <template #default="{ node, data }">
      <span class="tree-item" @mouseenter="treeNodeMouseenter(node)" @mouseleave="treeNodeMouseleave()">
        <span class="tree-item-name-wrapper">
          <!-- 数据库图标 -->
          <SvgIcon icon-name="pymeter-database" class-name="tree-item-icon" />
          <!-- 数据库名称 -->
          <span class="tree-item-name">{{ node.label }}</span>
          <!-- 类型标签 -->
          <el-tag v-if="data.dbType == 'MYSQL'" type="info" size="small" disable-transitions>MySQL</el-tag>
          <el-tag v-if="data.dbType == 'ORACLE'" type="info" size="small" disable-transitions>Oracle</el-tag>
          <el-tag v-if="data.dbType == 'POSTGRESQL'" type="info" size="small" disable-transitions>PostgreSQL</el-tag>
          <el-tag v-if="data.dbType == 'SQL_SERVER'" type="info" size="small" disable-transitions>SQL Server</el-tag>
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
    popper-class="database-menu-popover"
    virtual-triggering
    :hide-after="50"
    :placement="menuPlacement"
    :virtual-ref="menuTriggerButtonRef"
    :popper-options="{ removeOnDestroy: true }"
    @hide="handleMenuHide"
  >
    <div style="display: flex; flex-direction: column">
      <el-button link @click="duplicateDatabaseEngine">复制</el-button>
      <el-button link @click="copyDatabaseEngineToWorkspace">复制空间</el-button>
      <el-button link @click="moveDatabaseEngineToWorkspace">移动空间</el-button>
      <el-button link @click="deleteDatabaseEngine">删除</el-button>
    </div>
  </el-popover>
</template>

<script lang="jsx" setup>
import * as DatabaseService from '@/api/script/database'
import useElTree from '@/composables/useElTree'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'
import { usePyMeterStore } from '@/store/pymeter'
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
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

onMounted(() => {
  pymeterStore.queryDatabaseEngineAll()
})

/**
 * 关闭操作菜单
 */
const closeMenu = () => {
  menuVisible.value = false
}

/**
 * 复制数据库
 */
const duplicateDatabaseEngine = async () => {
  const data = operatingNode.value.data
  closeMenu()
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认复制 {data.dbName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制数据库
  await DatabaseService.duplicateDatabaseEngine({ dbNo: data.dbNo })
  // 重新查询列表
  pymeterStore.queryDatabaseEngineAll()
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制数据库至指定空间
 */
const copyDatabaseEngineToWorkspace = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择复制的工作空间',
    message: (
      <WorkspaceTree
        key={data.dbNo}
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
  // 复制数据库到指定的空间
  await DatabaseService.copyDatabaseEngineToWorkspace({ dbNo: data.dbNo, workspaceNo })
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 移动数据库至指定空间
 */
const moveDatabaseEngineToWorkspace = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择移动的工作空间',
    message: (
      <WorkspaceTree
        key={data.dbNo}
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
  // 移动数据库到指定的空间
  await DatabaseService.moveDatabaseEngineToWorkspace({ dbNo: data.dbNo, workspaceNo })
  // 重新查询列表
  pymeterStore.queryDatabaseEngineAll()
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 删除数据库
 */
const deleteDatabaseEngine = async () => {
  const data = operatingNode.value.data
  closeMenu()
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认删除 {data.dbName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除数据库
  await DatabaseService.deleteDatabaseEngine({ dbNo: data.dbNo })
  // 重新查询列表
  pymeterStore.queryDatabaseEngineAll()
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 2 * 1000 })
}

/**
 * el-tree handler
 */
const handleNodeClick = (data) => {
  pymeterStore.addTab({
    editorNo: data.dbNo,
    editorName: data.dbName,
    editorComponent: 'DatabaseEngine',
    editorMode: 'QUERY',
    metadata: {
      sn: data.dbNo,
      name: data.dbName,
      component: 'DatabaseEngine',
      databaseNo: data.dbNo
    }
  })
}

/**
 * el-tree 节点过滤
 */
const filterNode = (value, data) => {
  if (!value) return true
  return data.dbName.indexOf(value) !== -1
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
.database-menu-popover {
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

.database-menu--top-option > span {
  justify-content: space-between;
  width: 100%;
}

.database-menu--shortcut-option > span {
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
  width: 1.6em !important;
  height: 1.6em !important;
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

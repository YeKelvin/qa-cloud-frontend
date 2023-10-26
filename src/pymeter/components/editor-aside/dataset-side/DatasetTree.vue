<template>
  <el-tree
    ref="eltreeRef"
    node-key="datasetNo"
    :props="{ label: 'datasetName' }"
    :data="pymeterStore.datasetList"
    :filter-node-method="filterNode"
    @node-click="handleNodeClick"
  >
    <template #default="{ node, data }">
      <span class="tree-item" @mouseenter="treeNodeMouseenter(node)" @mouseleave="treeNodeMouseleave()">
        <span class="tree-item-name-wrapper">
          <span style="display: flex">
            <!-- 变量集类型标签 -->
            <span class="dataset-tag">
              <el-tag v-if="data.datasetType == 'GLOBAL'" type="danger" disable-transitions>全 局</el-tag>
              <el-tag v-if="data.datasetType == 'WORKSPACE'" type="danger" disable-transitions>空 间</el-tag>
              <el-tag v-if="data.datasetType == 'ENVIRONMENT'" disable-transitions>环 境</el-tag>
              <el-tag v-if="data.datasetType == 'CUSTOM'" type="warning" disable-transitions>自定义</el-tag>
            </span>
            <!-- 变量集名称 -->
            <span class="tree-item-name">{{ node.label }}</span>
          </span>
          <span>
            <el-tag v-if="data.datasetBinding" style="margin-right: 5px" type="info" disable-transitions>
              {{ getBoundDatasetName(data.datasetBinding) }}
            </el-tag>
          </span>
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
    popper-class="dataset-menu-popover"
    virtual-triggering
    :hide-after="50"
    :placement="menuPlacement"
    :virtual-ref="menuTriggerButtonRef"
    :popper-options="{ removeOnDestroy: true }"
    @hide="handleMenuHide"
  >
    <div style="display: flex; flex-direction: column">
      <el-button link :disabled="disabledOperation" @click="modifyDataset">编辑</el-button>
      <el-button link :disabled="disabledOperation" @click="duplicateDataset">复制</el-button>
      <el-button link :disabled="disabledOperation" @click="copyDatasetToWorkspace">复制空间</el-button>
      <el-button link :disabled="disabledOperation" @click="moveDatasetToWorkspace">移动空间</el-button>
      <el-button link :disabled="disabledOperation" @click="deleteDataset">删除</el-button>
    </div>
  </el-popover>
</template>

<script lang="jsx" setup>
import * as VariablesService from '@/api/script/variables'
import useElTree from '@/composables/useElTree'
import EnvDatasetSelect from '@/pymeter/components/editor-aside/common/EnvDatasetSelect.vue'
import NameInput from '@/pymeter/components/editor-aside/common/NameInput.vue'
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
const operatingDatasetType = computed(() => operatingNode.value?.data?.datasetType)
const disabledOperation = computed(() => ['GLOBAL', 'WORKSPACE'].includes(operatingDatasetType.value))

/**
 * 关闭操作菜单
 */
const closeMenu = () => {
  menuVisible.value = false
}

const getBoundDatasetName = (datasetNo) => {
  const results = pymeterStore.environmentDatasetList.filter((item) => item.datasetNo === datasetNo)
  return results ? results[0].datasetName : ''
}

/**
 * 编辑变量集
 */
const modifyDataset = async () => {
  if (operatingDatasetType.value === 'ENVIRONMENT') {
    renameDataset()
  } else {
    renameAndRebindDataset()
  }
}

/**
 * 重命名和重新绑定环境
 */
const renameAndRebindDataset = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let newName = data.datasetName
  let newBinding = data.datasetBinding?.datasetNo
  // 弹出名称对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '编辑变量集',
    message: (
      <div>
        <NameInput modelValue={newName} onUpdate:modelValue={(val) => (newName = val)} />
        <EnvDatasetSelect modelValue={newBinding} onUpdate:modelValue={(val) => (newBinding = val)} />
      </div>
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 修改变量集
  await VariablesService.modifyVariableDataset({
    datasetNo: data.datasetNo,
    datasetName: newName,
    datasetBinding: newBinding
  })
  // 重新查询列表
  pymeterStore.queryDatasetAll()
  // 重命名tab
  pymeterStore.updateTab({ editorNo: data.datasetNo, editorName: newName })
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 重命名变量集
 */
const renameDataset = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let newName = data.datasetName
  // 弹出名称对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '重命名变量集',
    message: <NameInput modelValue={newName} onUpdate:modelValue={(val) => (newName = val)} />,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 修改变量集
  await VariablesService.modifyVariableDataset({
    datasetNo: data.datasetNo,
    datasetName: newName
  })
  // 重新查询列表
  pymeterStore.queryDatasetAll()
  // 重命名tab
  pymeterStore.updateTab({ editorNo: data.datasetNo, editorName: newName })
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制变量集
 */
const duplicateDataset = async () => {
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
        是否确定复制 {data.datasetName} ？
      </span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制变量集
  await VariablesService.duplicateVariableDataset({ datasetNo: data.datasetNo })
  // 重新查询列表
  pymeterStore.queryDatasetAll()
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制变量集至指定空间
 */
const copyDatasetToWorkspace = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择复制的工作空间',
    message: (
      <WorkspaceTree
        key={data.datasetNo}
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
  // 复制变量集到指定的空间
  await VariablesService.copyVariableDatasetToWorkspace({ datasetNo: data.datasetNo, workspaceNo })
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 移动变量集至指定空间
 */
const moveDatasetToWorkspace = async () => {
  const data = operatingNode.value.data
  closeMenu()
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择移动的工作空间',
    message: (
      <WorkspaceTree
        key={data.datasetNo}
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
  // 移动变量集到指定的空间
  await VariablesService.moveVariableDatasetToWorkspace({ datasetNo: data.datasetNo, workspaceNo })
  // 重新查询列表
  pymeterStore.queryDatasetAll()
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 删除变量集
 */
const deleteDataset = async () => {
  const data = operatingNode.value.data
  closeMenu()
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认删除 {data.datasetName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除变量集
  await VariablesService.deleteVariableDataset({ datasetNo: data.datasetNo })
  // 重新查询列表
  pymeterStore.queryDatasetAll()
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 2 * 1000 })
}

/**
 * el-tree handler
 */
const handleNodeClick = (data) => {
  pymeterStore.addTab({
    editorNo: data.datasetNo,
    editorName: data.datasetName,
    editorComponent: 'VariableDataset',
    editorMode: 'QUERY'
  })
}

/**
 * el-tree 节点过滤
 */
const filterNode = (value, data) => {
  if (!value) return true
  return data.datasetName.indexOf(value) !== -1
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
.dataset-menu-popover {
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

.dataset-menu--top-option > span {
  justify-content: space-between;
  width: 100%;
}

.dataset-menu--shortcut-option > span {
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
  justify-content: space-between;
  width: 100%;
  user-select: none;
}

.tree-item-icon {
  width: 1.6em !important;
  height: 1.6em !important;
  padding-right: 5px;
}

.tree-item-name {
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dataset-tag {
  .el-tag {
    width: 56px;
  }
}

:deep(.el-tree-node__content) {
  height: 100%;
  min-height: 30px;
}
</style>

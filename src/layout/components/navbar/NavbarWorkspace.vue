<template>
  <el-popover ref="elpopoverRef" placement="bottom" width="400px" trigger="click">
    <!-- 切换工作空间的按钮 -->
    <template #reference>
      <el-button link>
        <span style="margin-left: 10px">{{ workspaceStore.workspaceName }}</span>
        <el-icon style="margin-left: 5px"><caret-bottom /></el-icon>
      </el-button>
    </template>

    <!-- 过滤input -->
    <el-input v-model="filterText" placeholder="搜索空间" style="margin-bottom: 10px" />

    <!-- 工作空间列表 -->
    <el-tree
      ref="eltreeRef"
      highlight-current
      :props="{ label: 'workspaceName' }"
      :data="workspaceStore.workspaceList"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <!-- 空间名称 -->
        <span class="workspace-name">{{ node.label }}</span>
        <!-- 标签 -->
        <template v-if="data.workspaceScope == 'PRIVATE'">
          <el-tag size="small" type="danger" style="margin-left: 5px" disable-transitions>个人</el-tag>
        </template>
        <template v-if="data.workspaceScope == 'PROTECTED'">
          <el-tag size="small" type="warning" style="margin-left: 5px" disable-transitions>团队</el-tag>
        </template>
        <template v-if="data.workspaceScope == 'PUBLIC'">
          <el-tag size="small" type="success" style="margin-left: 5px" disable-transitions>公共</el-tag>
        </template>
      </template>
    </el-tree>
  </el-popover>
</template>

<script setup>
import { CaretBottom } from '@element-plus/icons-vue'
import { useWorkspaceStore } from '@/store/workspace'

const workspaceStore = useWorkspaceStore()

const elpopoverRef = ref()
const eltreeRef = ref()
const filterText = ref('')

watch(filterText, (val) => eltreeRef.value.filter(val))

onMounted(() => workspaceStore.loadWorkspaceList())

const handleNodeClick = (node) => {
  workspaceStore.changeWorkspace(node)
  elpopoverRef.value.hide()
}
const filterNode = (value, data) => {
  if (!value) return true
  return data.workspaceName.indexOf(value) !== -1
}
</script>

<style lang="scss" scoped>
.workspace-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-tree-node__content) {
  justify-content: space-between;
  padding: 0 10px !important;

  .el-tree-node__expand-icon {
    display: none;
  }
}

:deep(.el-tree-node__label) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

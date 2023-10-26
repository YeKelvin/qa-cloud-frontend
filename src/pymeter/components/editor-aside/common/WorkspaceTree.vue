<template>
  <el-tree ref="tree" highlight-current :props="{ label: 'workspaceName' }">
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
</template>

<script setup>
import { ElTag, ElTree } from 'element-plus'
</script>

<style lang="scss" scoped>
.workspace-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-tag {
  margin-left: 5px;
}

:deep(.el-tree-node__content) {
  justify-content: space-between;
  padding: 0 20px 0 10px !important;
  margin-bottom: 5px;

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

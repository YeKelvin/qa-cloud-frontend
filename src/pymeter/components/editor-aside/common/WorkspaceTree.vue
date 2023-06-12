<template>
  <el-tree ref="tree" highlight-current :props="{ label: 'workspaceName' }">
    <template #default="{ node, data }">
      <!-- 空间名称 -->
      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ node.label }}</span>
      <!-- 标签 -->
      <el-tag v-if="data.workspaceScope == 'PRIVATE'" size="small" type="danger" disable-transitions>Private</el-tag>
      <el-tag v-if="data.workspaceScope == 'PROTECTED'" size="small" type="warning" disable-transitions>
        Protected
      </el-tag>
      <el-tag v-if="data.workspaceScope == 'PUBLIC'" size="small" type="success" disable-transitions>Public</el-tag>
    </template>
  </el-tree>
</template>

<script setup>
import { ElTag, ElTree } from 'element-plus'
</script>

<style lang="scss" scoped>
.el-tag {
  margin-left: 5px;
}
</style>

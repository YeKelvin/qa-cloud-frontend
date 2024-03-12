<template>
  <div class="workpsace-info">
    <!-- 基本信息 -->
    <div class="top-title">基本信息</div>
    <el-card shadow="hover">
      <el-row>
        <el-col :span="8" class="item-title">空间编号</el-col>
        <el-col :span="12">{{ workspaceStore.workspaceNo }}</el-col>
        <el-col :span="4" />
      </el-row>
      <el-divider />
      <el-row>
        <el-col :span="8" class="item-title">空间名称</el-col>
        <el-col :span="12">{{ workspaceStore.workspaceName }}</el-col>
        <el-col :span="4" />
      </el-row>
    </el-card>

    <!-- 空间操作 -->
    <div class="top-title">空间操作</div>
    <el-card shadow="hover">
      <el-row>
        <el-col :span="8" class="item-title">克隆空间</el-col>
        <el-col :span="12">克隆空间但不包含脚本</el-col>
        <el-col :span="4"><el-button type="primary" plain @click="cloneWorkspace()">克隆空间</el-button></el-col>
      </el-row>
    </el-card>

    <!-- 危险操作 -->
    <div class="top-title danger">危险操作</div>
    <el-card shadow="hover" style="border: 1px solid var(--el-color-danger-light-3)">
      <el-row>
        <el-col :span="8" class="item-title">删除空间</el-col>
        <el-col :span="12">务必谨慎，删除后空间不可找回</el-col>
        <el-col :span="4"><el-button type="danger" plain @click="deleteWorkspace()">删除空间</el-button></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { useWorkspaceStore } from '@/store/workspace'

const workspaceStore = useWorkspaceStore()

const cloneWorkspace = () => {
  ElMessage({ message: '功能开发中，敬请期待', type: 'info', duration: 2 * 1000 })
}

const deleteWorkspace = () => {
  ElMessage({ message: '功能开发中，敬请期待', type: 'info', duration: 2 * 1000 })
}
</script>

<style lang="scss" scoped>
.top-title {
  margin-top: 30px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;

  &:first-child {
    margin-top: 0;
  }
}

.danger {
  color: var(--el-color-danger);
}

.item-title {
  font-weight: bold;
}

[class*='el-col-'] {
  display: flex;
  align-items: center;
}
</style>

<template>
  <el-dialog title="新增工作空间" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="120px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="空间名称：" prop="workspaceName">
        <el-input v-model="formData.workspaceName" clearable />
      </el-form-item>
      <el-form-item label="空间作用域：" prop="workspaceScope">
        <el-select v-model="formData.workspaceScope" style="width: 100%">
          <el-option label="个人" value="PRIVATE" />
          <el-option label="团队" value="PROTECTED" />
          <el-option label="公共" value="PUBLIC" />
        </el-select>
      </el-form-item>
      <el-form-item label="空间描述：" prop="workspaceDesc">
        <el-input v-model="formData.workspaceDesc" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm()">提 交</el-button>
        <el-button @click="$refs.elformRef.resetFields()">重 置</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useWorkspaceStore } from '@/store/workspace'
import * as WorkspaceService from '@/api/public/workspace'

const emit = defineEmits(['update:model-value', 're-query'])
const workspaceStore = useWorkspaceStore()
const elformRef = ref()
const formData = ref({
  workspaceName: '',
  workspaceScope: '',
  workspaceDesc: ''
})
const formRules = reactive({
  workspaceName: [{ required: true, message: '工作空间名称不能为空', trigger: 'blur' }],
  workspaceScope: [{ required: true, message: '工作空间作用域不能为空', trigger: 'blur' }]
})

/**
 * 提交表单
 */
const submitForm = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 创建空间
  await WorkspaceService.createWorkspace(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
  // 重新查询工作空间列表
  workspaceStore.loadsWorkspaceList()
}
</script>

<style lang="scss" scoped></style>

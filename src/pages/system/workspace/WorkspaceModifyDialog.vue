<template>
  <el-dialog title="编辑工作空间" width="50%" center @close="$emit('update:model-value', false)">
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
        <el-button type="danger" @click="submitForm()">保 存</el-button>
        <el-button @click="$emit('update:model-value', false)">取 消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'

import * as WorkspaceService from '@/api/public/workspace'

const emit = defineEmits(['update:model-value', 're-query'])
const currentRow = inject('currentRow', null)
const elformRef = ref()
const formData = ref({
  workspaceNo: '',
  workspaceName: '',
  workspaceScope: '',
  workspaceDesc: ''
})
const formRules = reactive({
  workspaceName: [{ required: true, message: '工作空间名称不能为空', trigger: 'blur' }],
  workspaceScope: [{ required: true, message: '工作空间作用域不能为空', trigger: 'blur' }]
})

onMounted(() => {
  formData.value = currentRow.value
})

/**
 * 提交表单
 */
const submitForm = async () => {
  let error = false
  // 表单校验
  error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 二次确认
  error = await ElMessageBox.confirm('是否确定修改?', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 修改空间
  await WorkspaceService.modifyWorkspace(formData.value)
  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>

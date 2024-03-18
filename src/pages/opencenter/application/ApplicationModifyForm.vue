<template>
  <el-dialog title="编辑应用" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="100px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="应用名称：" prop="appName">
        <el-input v-model="formData.appName" clearable />
      </el-form-item>
      <el-form-item label="应用代码：" prop="appCode">
        <el-input v-model="formData.appCode" clearable />
      </el-form-item>
      <el-form-item label="应用备注：" prop="appDesc">
        <el-input v-model="formData.appDesc" clearable />
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

import * as ApplicationService from '@/api/opencenter/application'

const emit = defineEmits(['update:model-value', 're-query'])
const currentRow = inject('currentRow', null)
const elformRef = ref()
const formData = ref({
  appNo: '',
  appName: '',
  appCode: '',
  appDesc: ''
})
const formRules = reactive({
  appName: [{ required: true, message: '应用名称不能为空', trigger: 'blur' }]
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
  error = await ElMessageBox.confirm('确定修改吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 修改应用
  await ApplicationService.modifyApplication(formData.value)
  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>

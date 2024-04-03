<template>
  <el-dialog title="新增应用" width="50%" center @close="$emit('update:model-value', false)">
    <el-form ref="elformRef" label-width="100px" :model="formData" :rules="formRules">
      <el-form-item label="应用名称：" prop="appName">
        <el-input v-model="formData.appName" clearable />
      </el-form-item>
      <el-form-item label="应用代码：" prop="appCode">
        <el-input v-model="formData.appCode" clearable />
      </el-form-item>
      <el-form-item label="应用描述：" prop="appDesc">
        <el-input v-model="formData.appDesc" type="textarea" />
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

import * as ApplicationService from '@/api/opencenter/application'

const emit = defineEmits(['update:model-value', 're-query'])
const elformRef = ref()
const formData = ref({
  appName: '',
  appCode: '',
  appDesc: ''
})
const formRules = reactive({
  appName: [{ required: true, message: '应用名称不能为空', trigger: 'blur' }]
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
  // 新增应用
  await ApplicationService.createApplication(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>

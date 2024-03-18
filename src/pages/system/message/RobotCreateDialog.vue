<template>
  <el-dialog title="新增通知机器人" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="140px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="机器人类型：" prop="robotType">
        <el-radio-group v-model="formData.robotType">
          <el-radio value="WECOM">企业微信</el-radio>
          <el-radio value="DINGTALK" disabled>钉钉</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="机器人名称：" prop="robotName">
        <el-input v-model="formData.robotName" clearable />
      </el-form-item>
      <el-form-item label="机器人描述：" prop="robotDesc">
        <el-input v-model="formData.robotDesc" clearable />
      </el-form-item>
      <el-form-item label="Webhook Key：" prop="robotConfig.key">
        <el-input v-model="formData.robotConfig.key" class="no-autofill-pwd" clearable />
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

import * as MessageService from '@/api/public/message'
import { useWorkspaceStore } from '@/store/workspace'

const emit = defineEmits(['update:model-value', 're-query'])
const workspaceStore = useWorkspaceStore()
const elformRef = ref()
const formData = ref({
  workspaceNo: workspaceStore.workspaceNo,
  robotName: '',
  robotDesc: '',
  robotType: 'WECOM',
  robotConfig: {
    key: ''
  }
})
const formRules = reactive({
  robotName: [{ required: true, message: '机器人名称不能为空', trigger: 'blur' }],
  robotType: [{ required: true, message: '机器人类型不能为空', trigger: 'blur' }],
  'robotConfig.key': [{ required: true, message: '机器人配置不能为空', trigger: 'blur' }]
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
  // 创建机器人
  await MessageService.createNoticeRobot(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped>
.no-autofill-pwd {
  :deep(.el-input__inner) {
    -webkit-text-security: disc !important;
  }
}
</style>

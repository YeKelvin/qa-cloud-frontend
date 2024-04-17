<template>
  <el-dialog title="新增通知机器人" width="50%" center @close="$emit('update:model-value', false)">
    <el-form ref="elformRef" label-width="120px" :model="formData" :rules="formRules">
      <el-form-item label="机器人类型：" prop="botType">
        <el-radio-group v-model="formData.botType">
          <el-radio value="WECOM">企业微信</el-radio>
          <el-radio value="DINGTALK" disabled>钉钉</el-radio>
          <el-radio value="FEISHU" disabled>飞书</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="机器人名称：" prop="botName">
        <el-input v-model="formData.botName" clearable />
      </el-form-item>
      <el-form-item label="机器人描述：" prop="botDesc">
        <el-input v-model="formData.botDesc" type="textarea" />
      </el-form-item>
      <el-form-item label="Webhook：" prop="botWebhook">
        <el-input v-model="formData.botWebhook" type="textarea" />
      </el-form-item>
      <el-form-item v-if="formData.botType !== 'WECOM'" label="加签密钥：" prop="botSecret">
        <el-input v-model="formData.botSecret" clearable />
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

import * as NoticeService from '@/api/messaging/notice'
import { useWorkspaceStore } from '@/store/workspace'

const emit = defineEmits(['update:model-value', 're-query'])
const workspaceStore = useWorkspaceStore()
const elformRef = ref()
const formData = ref({
  workspaceNo: workspaceStore.workspaceNo,
  botName: '',
  botDesc: '',
  botType: 'WECOM',
  botWebhook: '',
  botSecret: ''
})
const formRules = reactive({
  botName: [{ required: true, message: '机器人名称不能为空', trigger: 'blur' }],
  botType: [{ required: true, message: '机器人类型不能为空', trigger: 'blur' }],
  botWebhook: [{ required: true, message: '机器人Webhook地址不能为空', trigger: 'blur' }]
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
  await NoticeService.createNoticeBot(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>

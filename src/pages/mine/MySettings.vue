<template>
  <el-form
    ref="elformRef"
    label-position="top"
    style="width: 100%; padding: 0 40px; margin-top: 40px"
    inline-message
    :model="formData"
    :rules="formRules"
  >
    <el-card shadow="hover">
      <el-form-item label="编辑器：单击组件打开详情" prop="'pymeter.component.details.open.mode'">
        <el-select v-model="formData['pymeter.component.open.with.singleclick']">
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
    </el-card>

    <el-form-item style="margin-top: 40px">
      <el-button type="primary" @click="save()">保 存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { assign } from 'lodash-es'

import * as UserService from '@/api/usercenter/user'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const elformRef = ref()
const formData = ref({
  'pymeter.component.open.with.singleclick': false,
  'pymeter.component.enable.preview': false
})
const formRules = {}

onMounted(() => {
  assign(formData.value, userStore.settings)
})

/**
 * 提交表单
 */
const save = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 修改用户设置
  await UserService.modifyUserSettings({ data: formData.value })
  // 更新 store 数据
  userStore.settings = formData.value
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
}
</script>

<style lang="scss" scoped></style>

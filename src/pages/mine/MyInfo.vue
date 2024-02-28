<template>
  <el-form
    ref="elformRef"
    label-width="100px"
    style="width: 100%; padding: 0 40px; margin-top: 40px"
    inline-message
    :model="formData"
    :rules="formRules"
  >
    <el-form-item label="用户头像：" prop="avatar">
      <el-image :src="userStore.avatar" fit="fill" class="user-avatar" />
    </el-form-item>
    <el-form-item label="用户名称：" prop="userName">
      <el-input v-model="formData.userName" clearable :disabled="userStore.sso" />
    </el-form-item>
    <el-form-item label="手机号码：" prop="mobile">
      <el-input v-model="formData.mobile" clearable :disabled="userStore.sso" />
    </el-form-item>
    <el-form-item label="邮箱地址：" prop="email">
      <el-input v-model="formData.email" clearable :disabled="userStore.sso" />
    </el-form-item>

    <el-form-item style="margin-top: 40px">
      <el-button type="primary" @click="save()">保 存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import * as UserService from '@/api/usercenter/user'

const userStore = useUserStore()
const elformRef = ref()
const formData = ref({
  userName: '',
  mobile: '',
  email: ''
})
const formRules = {
  userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }]
}

onMounted(() => {
  // 查询用户信息
  UserService.queryInfo().then((response) => {
    const user = response.data
    formData.value.userName = user.userName
    formData.value.mobile = user.mobile
    formData.value.email = user.email
  })
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
  // 修改用户信息
  await UserService.modifyUserInfo(formData.value)
  // 更新 store 数据
  userStore.name = formData.value.userName
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
}
</script>

<style lang="scss" scoped>
.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 10px;
}

:deep(.el-form-item) {
  align-items: center;
}
</style>

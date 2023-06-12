<template>
  <el-card shadow="hover" class="change-password-container">
    <template #header>
      <span>修改密码</span>
    </template>
    <el-form
      ref="elformRef"
      label-width="100px"
      style="width: 100%"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="旧密码：" prop="oldPassword">
        <el-input v-model="formData.oldPassword" type="password" show-password clearable />
      </el-form-item>

      <el-form-item label="新密码：" prop="newPassword">
        <el-input v-model="formData.newPassword" type="password" autocomplete="new-password" show-password clearable />
      </el-form-item>

      <el-form-item label="确认密码：" prop="confirm">
        <el-input v-model="formData.confirm" type="password" show-password clearable />
      </el-form-item>

      <el-form-item style="margin-top: 40px">
        <el-button type="primary" @click="save()">确 定</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { JSEncrypt } from 'jsencrypt'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import * as AuthService from '@/api/usercenter/auth'
import * as UserService from '@/api/usercenter/user'

const checkPassword = (_, value, callback) => {
  if (!value) {
    return callback(new Error('新密码不能为空'))
  }
  if (value.length < 6) {
    return callback(new Error('新密码不能少于6个字符'))
  }
  if (value.length >= 16) {
    return callback(new Error('新密码不能大于16个字符'))
  }
  for (let i = 0; i < value.length; i++) {
    if (!/[0-9a-z!@_]/i.test(value[i])) {
      return callback(new Error('新密码不能包含特殊字符'))
    }
  }

  return callback()
}

const checkConfirm = (_, value, callback) => {
  if (!value) {
    return callback(new Error('确认密码不能为空'))
  }
  if (value !== formData.value.newPassword) {
    return callback(new Error('密码确认不一致'))
  } else {
    return callback()
  }
}

const userStore = useUserStore()
const elformRef = ref()
const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirm: ''
})
const formRules = {
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [{ required: true, validator: checkPassword, trigger: 'blur' }],
  confirm: [{ required: true, validator: checkConfirm, trigger: 'blur' }]
}

/**
 * 获取rsa公钥
 */
const getPublicKey = async () => {
  const response = await AuthService.encryptionFactor()
  return {
    index: response.result.index,
    publicKey: response.result.publicKey
  }
}

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
  // rsa公钥加密
  const factor = await getPublicKey()
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(factor.publicKey)
  // 修改用户密码
  await UserService.modifyUserPassword({
    oldPassword: encryptor.encrypt(formData.value.oldPassword.trim()),
    newPassword: encryptor.encrypt(formData.value.newPassword.trim()),
    index: factor.index
  })
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
  // 清空用户信息，重新登录
  await userStore.resetToken()
  // 刷新页面
  location.reload()
}
</script>

<style lang="scss" scoped>
.change-password-container {
  width: 100%;
  margin: 0 40px;
  margin-top: 40px;
}

:deep(.el-card__header) {
  font-weight: 700;
}

:deep(.el-card__body) {
  height: 100%;
  width: 100%;
  padding: 20px;
}
</style>

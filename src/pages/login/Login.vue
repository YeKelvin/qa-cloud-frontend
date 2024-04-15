<template>
  <div class="login-container">
    <el-form
      ref="loginFormRef"
      class="login-form"
      auto-complete="on"
      label-position="left"
      :model="loginForm"
      :rules="loginRules"
    >
      <div class="title-container">
        <h3 class="title">QA Cloud</h3>
      </div>

      <el-tabs v-model="accountType" class="account-type-tabs">
        <el-tab-pane label="平台账号登录" name="default" />
        <el-tab-pane label="企业账号登录" name="enterprise" />
      </el-tabs>

      <el-form-item prop="loginName">
        <el-input
          ref="loginNameRef"
          v-model="loginForm.loginName"
          clearable
          type="text"
          tabindex="1"
          auto-complete="on"
          :placeholder="loginNamePlaceholder"
        >
          <template #prefix>
            <SvgIcon icon-name="login-user" />
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          ref="passwordRef"
          v-model="loginForm.password"
          clearable
          show-password
          tabindex="2"
          type="password"
          placeholder="密码"
          auto-complete="on"
          @keyup.enter="loginHandler"
        >
          <template #prefix>
            <SvgIcon icon-name="login-password" />
          </template>
        </el-input>
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        size="large"
        style="width: 100%; margin-bottom: 30px"
        @click.prevent="loginHandler"
      >
        登 录
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { isEmpty } from 'lodash-es'

import { useUserStore } from '@/store/user'

const validateLoginName = (_, value, callback) => {
  if (isEmpty(value)) {
    callback(new Error('账号不能为空'))
  } else {
    callback()
  }
}
const validatePassword = (_, value, callback) => {
  if (isEmpty(value)) {
    callback(new Error('密码不能为空'))
  } else {
    callback()
  }
}
const loginRules = {
  loginName: [{ required: true, trigger: 'blur', validator: validateLoginName }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }]
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loginForm = ref({
  loginName: '',
  password: ''
})
const accountType = ref('default')
const loading = ref(false)
const redirect = ref(undefined)
const loginFormRef = ref()
const loginNameRef = ref()
const passwordRef = ref()

const loginNamePlaceholder = computed(() => {
  return accountType.value === 'enterprise' ? '企业邮箱' : '账号 / 邮箱 / 手机号'
})

watch(
  route,
  (route) => {
    redirect.value = route.query && route.query.redirect
  },
  { immediate: true }
)

const loginHandler = async () => {
  // 表单校验
  const error = await loginFormRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 登录
  try {
    loading.value = true
    await userStore.login({ ...loginForm.value, accountType: accountType.value })
    router.push({ path: redirect.value || '/' }, () => {})
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error(error)
  }
}
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark-gray: #889aa4;
$light-gray: #eee;

.login-container {
  width: 100%;
  min-height: 100%;
  overflow: hidden;
  background-color: $bg;

  .login-form {
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .title-container {
    position: relative;

    .title {
      margin: 0 auto 40px;
      font-size: 28px;
      font-weight: bold;
      color: $light-gray;
      text-align: center;
    }
  }
}

:deep(.el-tabs) {
  padding: 0 10px;
}

:deep(.el-tabs__item) {
  font-size: 18px;
  font-weight: 400;
  color: $light-gray;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: $bg;
}
</style>

<style lang="scss">
$bg: #283443;
$light-gray: #fff;
$cursor: #fff;

.login-container {
  .el-form-item {
    color: #454545;
    background: rgb(0 0 0 / 10%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 5px;
  }

  .el-input {
    width: 100%;

    input {
      height: 47px;
      padding: 12px 5px 12px 15px;
      color: $light-gray;
      caret-color: $cursor;
      background: transparent;
      border: 0;
      border-radius: 0;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-input__inner {
    box-shadow: none !important;
  }

  .el-input__wrapper {
    background-color: inherit;
    box-shadow: none;
  }
}
</style>

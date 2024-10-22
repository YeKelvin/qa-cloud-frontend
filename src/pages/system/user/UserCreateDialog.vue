<template>
  <el-dialog title="用户注册" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="100px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="用户名称：" prop="userName">
        <el-input v-model="formData.userName" clearable />
      </el-form-item>
      <el-form-item label="登录账号：" prop="loginName">
        <el-input v-model="formData.loginName" clearable />
      </el-form-item>
      <el-form-item label="登录密码：" prop="password">
        <el-input v-model="formData.password" clearable />
      </el-form-item>
      <el-form-item label="手机号码：" prop="mobile">
        <el-input v-model="formData.mobile" clearable />
      </el-form-item>
      <el-form-item label="邮箱地址：" prop="email">
        <el-input v-model="formData.email" clearable />
      </el-form-item>
      <el-form-item label="用户角色：" prop="roles">
        <el-select v-model="formData.roles" multiple clearable tag-type="danger" style="width: 100%">
          <el-option v-for="role in roleList" :key="role.roleNo" :label="role.roleName" :value="role.roleNo" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户分组：" prop="groups">
        <el-select v-model="formData.groups" multiple clearable tag-type="danger" style="width: 100%">
          <el-option v-for="group in groupList" :key="group.groupNo" :label="group.groupName" :value="group.groupNo" />
        </el-select>
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

import * as GroupService from '@/api/usercenter/group'
import * as RoleService from '@/api/usercenter/role'
import * as UserService from '@/api/usercenter/user'

const validateMobile = (_, value, callback) => {
  if (value && !/^\d+$/.test(value)) {
    callback(new Error('手机号格式错误'))
  } else {
    callback()
  }
}
const validateEmail = (_, value, callback) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error('邮箱格式错误'))
  } else {
    callback()
  }
}

const emit = defineEmits(['update:model-value', 're-query'])
const elformRef = ref()
const formData = ref({
  userName: '',
  loginName: '',
  password: '',
  mobile: '',
  email: '',
  roles: [],
  groups: []
})
const formRules = reactive({
  userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  loginName: [{ required: true, message: '登录账号不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  mobile: [{ validator: validateMobile }],
  email: [{ validator: validateEmail }]
})
const groupList = ref([])
const roleList = ref([])

onMounted(() => {
  // 查询所有角色
  RoleService.queryRoleAll().then(response => {
    roleList.value = response.data
  })
  // 查询所有分组
  GroupService.queryGroupAll().then(response => {
    groupList.value = response.data
  })
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
  // 新增用户
  await UserService.createUser(formData.value)
  // 成功提示
  ElMessage({ message: '注册成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>

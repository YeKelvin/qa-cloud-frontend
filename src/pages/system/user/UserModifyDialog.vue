<template>
  <el-dialog title="编辑用户" width="50%" center @close="$emit('update:model-value', false)">
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
        <el-button type="danger" @click="submitForm()">保 存</el-button>
        <el-button @click="$emit('update:model-value', false)">取 消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { omit } from 'lodash-es'

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
const currentRow = inject('currentRow', null)
const elformRef = ref()
const formData = ref({
  userNo: '',
  userName: '',
  password: '',
  mobile: '',
  email: '',
  roles: [],
  groups: []
})
const formRules = reactive({
  userName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  mobile: [{ validator: validateMobile }],
  email: [{ validator: validateEmail }]
})
const groupList = ref([])
const roleList = ref([])

onMounted(() => {
  const rowData = currentRow.value
  // 除 roles, groups 属性外其余赋值给 form
  formData.value = omit(rowData, ['roles', 'groups'])
  // 提取 roleNo
  formData.value.roles = rowData.roles ? rowData.roles.map((item) => item.roleNo) : []
  // 提取 groupNo
  formData.value.groups = rowData.groups ? rowData.groups.map((item) => item.groupNo) : []
  // 查询所有角色
  RoleService.queryRoleAll().then((response) => {
    roleList.value = response.data
  })
  // 查询所有分组
  GroupService.queryGroupAll().then((response) => {
    groupList.value = response.data
  })
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
  error = await ElMessageBox.confirm('是否确定修改？', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 修改用户
  await UserService.modifyUser(formData.value)
  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>

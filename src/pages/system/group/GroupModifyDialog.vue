<template>
  <el-dialog title="编辑分组" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="100px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="分组名称：" prop="groupName">
        <el-input v-model="formData.groupName" clearable />
      </el-form-item>
      <el-form-item label="分组备注：" prop="groupDesc">
        <el-input v-model="formData.groupDesc" clearable />
      </el-form-item>
      <el-form-item label="分组角色：" prop="roles">
        <el-select v-model="formData.roles" style="width: 100%" tag-type="danger" multiple clearable>
          <el-option v-for="role in roleList" :key="role.roleNo" :label="role.roleName" :value="role.roleNo" />
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
import { omit as _omit } from 'lodash-es'

import * as GroupService from '@/api/usercenter/group'
import * as RoleService from '@/api/usercenter/role'

const emit = defineEmits(['update:model-value', 're-query'])
const currentRow = inject('currentRow', null)
const elformRef = ref()
const formData = ref({
  groupNo: '',
  groupName: '',
  groupDesc: '',
  roles: []
})
const formRules = reactive({
  groupName: [{ required: true, message: '分组名称不能为空', trigger: 'blur' }]
})
const roleList = ref([])

onMounted(() => {
  // 除 roles 属性外其余赋值给 form
  formData.value = _omit(currentRow.value, ['roles'])
  // 提取 roleNo
  formData.value.roles = currentRow.value ? currentRow.value.roles.map((item) => item.roleNo) : []
  // 查询所有角色
  RoleService.queryRoleAll().then((response) => {
    roleList.value = response.data
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
  error = await ElMessageBox.confirm('确定修改吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 修改分组
  await GroupService.modifyGroup(formData.value)
  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>

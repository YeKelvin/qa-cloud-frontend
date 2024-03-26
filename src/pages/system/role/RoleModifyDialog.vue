<template>
  <el-dialog title="编辑角色" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="100px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="角色名称：" prop="roleName">
        <el-input v-model="formData.roleName" clearable />
      </el-form-item>
      <el-form-item label="角色代码：" prop="roleCode">
        <el-input v-model="formData.roleCode" clearable />
      </el-form-item>
      <el-form-item label="角色等级：" prop="roleRank">
        <el-input v-model="formData.roleRank" clearable />
      </el-form-item>
      <el-form-item label="角色备注：" prop="roleDesc">
        <el-input v-model="formData.roleDesc" clearable />
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

import * as RoleService from '@/api/usercenter/role'

const emit = defineEmits(['update:model-value', 're-query'])
const currentRow = inject('currentRow', null)
const elformRef = ref()
const formData = ref({
  roleNo: '',
  roleName: '',
  roleCode: '',
  roleRank: 1,
  roleDesc: ''
})
const formRules = reactive({
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleCode: [{ required: true, message: '角色代码不能为空', trigger: 'blur' }],
  roleRank: [{ required: true, message: '角色等级不能为空', trigger: 'blur' }]
})

onMounted(() => {
  formData.value = currentRow.value
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
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 修改角色
  await RoleService.modifyRole(formData.value)
  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>

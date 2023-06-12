<template>
  <div class="role-permission-container">
    <!-- 标题 -->
    <div class="title-container">
      <span class="title">设置角色权限</span>
    </div>

    <!-- 权限表格 -->
    <div class="permission-table-container">
      <PermissionTable v-model:checkedList="checkedPermissionNumbers" />
    </div>

    <!-- 操作按钮 -->
    <div class="button-container">
      <el-button type="danger" style="margin-bottom: 20px" :icon="Check" @click="save">保 存</el-button>
      <el-button type="primary" style="margin-bottom: 20px" :icon="Close" @click="goBack">返 回</el-button>
    </div>
  </div>
</template>

<script setup>
import * as RoleService from '@/api/usercenter/role'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import PermissionTable from './PermissionTable.vue'

const route = useRoute()
const router = useRouter()

const roleNo = ref(route.query.roleNo)
const checkedPermissionNumbers = ref([])

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  RoleService.queryRolePermissions({ roleNo: roleNo.value }).then((response) => {
    checkedPermissionNumbers.value = response.result.map((item) => item.permissionNo)
  })
}

/**
 * 保存
 */
const save = () => {
  RoleService.setRolePermissions({
    roleNo: roleNo.value,
    permissionNumbers: checkedPermissionNumbers.value
  }).then(() => {
    ElMessage({ message: '设置权限成功', type: 'info', duration: 2 * 1000 })
    goBack()
  })
}

/**
 * 返回上一页
 */
const goBack = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/')
}
</script>

<style lang="scss" scoped>
.role-permission-container {
  display: flex;
  flex-direction: column;

  padding: 20px;
}

.title-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.title {
  color: #606266;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
}

.permission-table-container {
  margin-bottom: 20px;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<template>
  <div class="role-permission-container">
    <!-- 标题 -->
    <div class="title-container">
      <span class="title">设置空间限制</span>
    </div>

    <!-- 限制项 -->
    <div class="permission-table-container">
      <!-- 权限表格 -->
      <PermissionTable v-model:checkedList="checkedPermissions" style="margin-bottom: 20px" />
      <!-- 豁免成员和分组 -->
      <el-form label-width="90px" label-position="top" style="width: 100%">
        <el-form-item label="豁免成员：">
          <el-select v-model="exemptionUsers" style="width: 100%" tag-type="danger" filterable multiple>
            <el-option v-for="user in userList" :key="user.userNo" :label="user.userName" :value="user.userNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="豁免分组：">
          <el-select v-model="exemptionGroups" style="width: 100%" tag-type="danger" filterable multiple>
            <el-option
              v-for="group in groupList"
              :key="group.groupNo"
              :label="group.groupName"
              :value="group.groupNo"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="button-container">
      <el-button type="danger" style="margin-bottom: 20px" :icon="Check" @click="save">保 存</el-button>
      <el-button type="primary" style="margin-bottom: 20px" :icon="Close" @click="goBack">返 回</el-button>
    </div>
  </div>
</template>

<script setup>
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import PermissionTable from './PermissionTable.vue'

import * as WorkspaceService from '@/api/system/workspace'
import * as GroupService from '@/api/usercenter/group'
import * as UserService from '@/api/usercenter/user'

const route = useRoute()
const router = useRouter()

const workspaceNo = ref(route.query.workspaceNo)
const userList = ref([])
const groupList = ref([])
const checkedPermissions = ref([])
const exemptionUsers = ref([])
const exemptionGroups = ref([])

onMounted(() => {
  // 查询所有用户
  UserService.queryUserAll().then((response) => {
    userList.value = response.data
  })
  // 查询所有分组
  GroupService.queryGroupAll().then((response) => {
    groupList.value = response.data
  })
  // 查询空间限制和豁免成员
  WorkspaceService.queryWorkspaceRestriction({ workspaceNo: workspaceNo.value }).then((response) => {
    checkedPermissions.value = response.data.permissionList.map((item) => item.permissionNo)
    exemptionUsers.value = response.data.users
    exemptionGroups.value = response.data.groups
  })
})

/**
 * 保存
 */
const save = () => {
  WorkspaceService.setWorkspaceRestriction({
    workspaceNo: workspaceNo.value,
    permissions: checkedPermissions.value,
    users: exemptionUsers.value,
    groups: exemptionGroups.value
  }).then(() => {
    ElMessage({ message: '设置限制成功', type: 'info', duration: 2 * 1000 })
    goBack()
  })
}

/**
 * 返回上一页
 */
const goBack = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/system/workspace')
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
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.permission-table-container {
  margin-bottom: 20px;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

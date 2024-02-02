<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.userNo" label="用户编号" />
        <ConditionInput v-model="queryConditions.userName" label="用户名称" />
        <ConditionInput v-model="queryConditions.loginName" label="登录账号" />
        <ConditionInput v-model="queryConditions.mobile" label="手机号码" />
        <ConditionInput v-model="queryConditions.email" label="邮箱地址" />
        <ConditionSelect v-model="queryConditions.state" :options="UserState" label="用户状态" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" :icon="Search" @click="query()">查 询</el-button>
          <el-button :icon="Refresh" @click="resetQueryConditions()">重 置</el-button>
        </div>
        <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">新 增</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="userNo" label="用户编号" min-width="180" width="180" />
        <el-table-column prop="userName" label="用户名称" min-width="150" />
        <el-table-column prop="loginName" label="登录账号" min-width="150" />
        <el-table-column prop="mobile" label="手机号码" min-width="150" />
        <el-table-column prop="email" label="邮箱地址" min-width="150" />
        <el-table-column prop="roles" label="用户角色" min-width="150">
          <template #default="{ row }">
            <div class="tags-wrapper">
              <el-tag v-for="role in row.roles" :key="role.roleNo" type="danger" disable-transitions>
                {{ role.roleName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="groups" label="分组" min-width="150">
          <template #default="{ row }">
            <div class="tags-wrapper">
              <el-tag v-for="group in row.groups" :key="group.groupNo" type="danger" disable-transitions>
                {{ group.groupName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" min-width="60" width="60">
          <template #default="{ row }">{{ UserState[row.state] }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="160" width="160">
          <template #default="{ row }">
            <el-button type="primary" link @click="openModifyDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="resetPassword(row)">重置密码</el-button>
            <template v-if="row.state === 'ENABLE'">
              <el-button type="primary" link @click="modifyUserState(row, 'DISABLE')">禁用</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link @click="modifyUserState(row, 'ENABLE')">启用</el-button>
            </template>
            <el-button type="primary" link @click="deleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 25, 50, 100]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 创建用户表单 -->
    <CreateDialog v-if="showCreateDialog" v-model="showCreateDialog" @re-query="query" />
    <!-- 编辑用户表单 -->
    <ModifyDialog v-if="showModifyDialog" v-model="showModifyDialog" @re-query="query" />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { UserState } from '@/api/enum'
import * as UserService from '@/api/usercenter/user'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import CreateDialog from './UserCreateDialog.vue'
import ModifyDialog from './UserModifyDialog.vue'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  userNo: '',
  userName: '',
  loginName: '',
  mobile: '',
  email: '',
  state: '',
  roles: []
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref({})
const showCreateDialog = ref(false)
const showModifyDialog = ref(false)

provide('currentRow', currentRow)

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  UserService.queryUserList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then((response) => {
    tableData.value = response.result.data
    total.value = response.result.total
  })
}

/**
 * 修改用户状态
 */
const modifyUserState = async (row, state) => {
  const message = state === 'DISABLE' ? '禁用' : '启用'
  // 二次确认
  const cancelled = await ElMessageBox.confirm(`确定${message}吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 修改用户状态
  await UserService.modifyUserState({ userNo: row.userNo, state: state })
  // 成功提示
  ElMessage({ message: `${message}成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 重置用户密码
 */
const resetPassword = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('确定重置密码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 重置用户密码
  await UserService.resetPassword({ userNo: row.userNo })
  // 成功提示
  ElMessage({ message: '重置用户密码成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 删除用户
 */
const deleteUser = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定删除？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除用户
  await UserService.deleteUser({ userNo: row.userNo })
  // 成功提示
  ElMessage({ message: '删除用户成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 打开编辑对话框
 */
const openModifyDialog = (row) => {
  showModifyDialog.value = true
  currentRow.value = row
}

/**
 * pagination handler
 */
const handleSizeChange = (val) => {
  pageSize.value = val
  query()
}

/**
 * pagination handler
 */
const handleCurrentChange = (val) => {
  page.value = val
  query()
}
</script>

<style lang="scss" scoped>
.conditions-container {
  display: flex;
  flex: none;
  flex-wrap: wrap;
}

.table-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
}

.pagination-container {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  padding: 10px 0;
  padding-right: 10px;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;

  .el-tag {
    margin-right: 5px;
    margin-bottom: 5px;
  }
}

:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>

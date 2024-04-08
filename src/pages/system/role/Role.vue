<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.roleNo" label="角色编号" />
        <ConditionInput v-model="queryConditions.roleName" label="角色名称" />
        <ConditionInput v-model="queryConditions.roleCode" label="角色代码" />
        <ConditionInput v-model="queryConditions.roleDesc" label="角色描述" />
        <ConditionSelect v-model="queryConditions.state" :options="RoleState" label="角色状态" />
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
        <el-table-column prop="roleNo" label="角色编号" min-width="200" width="200" />
        <el-table-column prop="roleName" label="角色名称" min-width="150" />
        <el-table-column prop="roleCode" label="角色代码" min-width="150" />
        <el-table-column prop="roleRank" label="角色等级" min-width="150" />
        <el-table-column prop="roleDesc" label="角色描述" min-width="150" />
        <el-table-column prop="roleType" label="角色类型" min-width="150">
          <template #default="{ row }">{{ RoleType[row.roleType] }}</template>
        </el-table-column>
        <el-table-column prop="state" label="状态" min-width="60" width="60">
          <template #default="{ row }">{{ RoleState[row.state] }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="180" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="gotoRolePermissions(row)">权限管理</el-button>
            <el-button type="primary" link @click="openModifyDialog(row)">编辑</el-button>
            <template v-if="row.state === 'ENABLE'">
              <el-button type="primary" link @click="modifyRoleState(row, 'DISABLE')">禁用</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link @click="modifyRoleState(row, 'ENABLE')">启用</el-button>
            </template>
            <el-button v-if="row.roleType == 'CUSTOM'" type="primary" link @click="deleteRole(row)">删除</el-button>
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

    <!-- 创建角色表单 -->
    <CreateDialog v-if="showCreateDialog" v-model="showCreateDialog" @re-query="query" />
    <!-- 编辑角色表单 -->
    <ModifyDialog v-if="showModifyDialog" v-model="showModifyDialog" @re-query="query" />
  </div>
</template>

<script setup>
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import CreateDialog from './RoleCreateDialog.vue'
import ModifyDialog from './RoleModifyDialog.vue'

import { RoleState, RoleType } from '@/api/enum'
import * as RoleService from '@/api/usercenter/role'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'

const router = useRouter()
const { queryConditions, resetQueryConditions } = useQueryConditions({
  roleNo: '',
  roleName: '',
  roleCode: '',
  roleDesc: '',
  roleType: '',
  state: ''
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
  RoleService.queryRoleList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then((response) => {
    tableData.value = response.data.list
    total.value = response.data.total
  })
}

/**
 * 修改角色状态
 */
const modifyRoleState = async (row, state) => {
  const stateMsg = state === 'DISABLE' ? '禁用' : '启用'
  // 二次确认
  const cancelled = await ElMessageBox.confirm(`是否确定${stateMsg}？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 修改角色状态
  await RoleService.modifyRoleState({ roleNo: row.roleNo, state: state })
  // 成功提示
  ElMessage({ message: `${stateMsg}角色成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 删除角色
 */
const deleteRole = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定删除？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除角色
  await RoleService.deleteRole({ roleNo: row.roleNo })
  // 成功提示
  ElMessage({ message: '删除角色成功', type: 'info', duration: 2 * 1000 })
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
 * 跳转至角色权限管理页
 */
const gotoRolePermissions = ({ roleNo }) => {
  router.push({ path: 'role/permissions', query: { roleNo: roleNo } })
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

:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>

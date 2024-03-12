<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.workspaceNo" label="空间编号" />
        <ConditionInput v-model="queryConditions.workspaceName" label="空间名称" />
        <ConditionInput v-model="queryConditions.workspaceScope" label="空间作用域" />
        <ConditionInput v-model="queryConditions.workspaceDesc" label="空间描述" />
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
        <el-table-column prop="workspaceNo" label="空间编号" min-width="200" width="200" />
        <el-table-column prop="workspaceName" label="空间名称" min-width="200" />
        <el-table-column prop="workspaceScope" label="空间作用域" min-width="200">
          <template #default="{ row }">{{ WorkspaceScope[row.workspaceScope] }}</template>
        </el-table-column>
        <el-table-column prop="workspaceDesc" label="空间描述" min-width="200" />
        <el-table-column fixed="right" label="操作" min-width="280" width="280">
          <template #default="{ row }">
            <template v-if="row.workspaceScope == 'PROTECTED'">
              <el-button type="primary" link @click="openMemberDialog(row)">成员管理</el-button>
            </template>
            <template v-if="row.workspaceScope != 'PRIVATE'">
              <el-button type="primary" link @click="gotoRestrictionManager(row)">限制管理</el-button>
              <el-button type="primary" link @click="openModifyDialog(row)">编辑</el-button>
              <el-button type="primary" link @click="deleteWorkspace(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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

    <!-- 创建空间表单 -->
    <CreateDialog v-if="showCreateDialog" v-model="showCreateDialog" @re-query="query" />
    <!-- 编辑空间表单 -->
    <ModifyDialog v-if="showModifyDialog" v-model="showModifyDialog" @re-query="query" />
    <!-- 空间成员管理列表 -->
    <MemberDialog v-if="showMemberDialog" v-model="showMemberDialog" />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { WorkspaceScope } from '@/api/enum'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import CreateDialog from './WorkspaceCreateDialog.vue'
import ModifyDialog from './WorkspaceModifyDialog.vue'
import MemberDialog from './WorkspaceMemberDialog.vue'
import * as WorkspaceService from '@/api/public/workspace'

const router = useRouter()
// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  workspaceNo: '',
  workspaceName: '',
  workspaceScope: '',
  workspaceDesc: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref({})
const showCreateDialog = ref(false)
const showModifyDialog = ref(false)
const showMemberDialog = ref(false)

provide('currentRow', currentRow)

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  WorkspaceService.queryWorkspaceList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then(
    (response) => {
      tableData.value = response.data.list
      total.value = response.data.total
    }
  )
}

/**
 * 删除空间
 */
const deleteWorkspace = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除空间
  await WorkspaceService.deleteWorkspace({ workspaceNo: row.workspaceNo })
  // 成功提示
  ElMessage({ message: '删除工作空间成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 跳转至空间权限页
 */
const gotoRestrictionManager = ({ workspaceNo }) => {
  router.push({ path: 'workspace/restrictions', query: { workspaceNo: workspaceNo } })
}

/**
 * 打开编辑对话框
 */
const openModifyDialog = (row) => {
  showModifyDialog.value = true
  currentRow.value = row
}

/**
 * 打开成员管理对话框
 */
const openMemberDialog = (row) => {
  showMemberDialog.value = true
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

:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>

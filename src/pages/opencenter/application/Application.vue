<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.appNo" label="应用编号" />
        <ConditionInput v-model="queryConditions.appName" label="应用名称" />
        <ConditionInput v-model="queryConditions.appCode" label="应用代码" />
        <ConditionInput v-model="queryConditions.appDesc" label="应用描述" />
        <ConditionSelect v-model="queryConditions.state" :options="ApplicationState" label="应用状态" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" :icon="Search" @click="query()">查 询</el-button>
          <el-button :icon="Refresh" @click="resetQueryConditions()">重 置</el-button>
        </div>
        <el-button type="primary" :icon="Plus" @click="showCreateForm = true">新 增</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="appNo" label="应用编号" min-width="180" width="180" />
        <el-table-column prop="appName" label="应用名称" min-width="150" />
        <el-table-column prop="appCode" label="应用代码" min-width="150" />
        <el-table-column prop="appDesc" label="应用描述" min-width="150" />
        <el-table-column prop="appSecret" label="应用密钥" min-width="150" />
        <el-table-column prop="state" label="状态" min-width="60" width="60">
          <template #default="{ row }">{{ ApplicationState[row.state] }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="200" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="openModifyForm(row)">编辑</el-button>
            <template v-if="row.state === 'ENABLE'">
              <el-button type="primary" link @click="modifyAppState(row, 'DISABLE')">禁用</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link @click="modifyAppState(row, 'ENABLE')">启用</el-button>
            </template>
            <el-button type="primary" link @click="resetSecret(row)">重置</el-button>
            <el-button type="primary" link @click="deleteApp(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 25, 50, 100]"
        :page-size="pageSize"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 创建应用表单 -->
    <CreateForm v-if="showCreateForm" v-model="showCreateForm" @re-query="query" />
    <!-- 编辑应用表单 -->
    <ModifyForm v-if="showModifyForm" v-model="showModifyForm" @re-query="query" />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ApplicationState } from '@/api/enum'
import * as ApplicationService from '@/api/opencenter/application'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import CreateForm from './ApplicationCreateForm.vue'
import ModifyForm from './ApplicationModifyForm.vue'

const { queryConditions, resetQueryConditions } = useQueryConditions({
  appNo: '',
  appName: '',
  appCode: '',
  appDesc: '',
  state: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref({})
const showCreateForm = ref(false)
const showModifyForm = ref(false)

provide('currentRow', currentRow)

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  ApplicationService.queryApplicationList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then(
    (response) => {
      tableData.value = response.result.data
      total.value = response.result.total
    }
  )
}

/**
 * 修改应用状态
 */
const modifyAppState = async (row, state) => {
  const stateMsg = state === 'DISABLE' ? '禁用' : '启用'
  // 二次确认
  const cancelled = await ElMessageBox.confirm(`确定${stateMsg}吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 修改应用状态
  await ApplicationService.modifyApplicationState({ appNo: row.appNo, state: state })
  // 成功提示
  ElMessage({ message: `${stateMsg}成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 重置应用密钥
 */
const resetSecret = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm(`是否确定重置？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 重置应用密钥
  await ApplicationService.resetApplicationSecret({ appNo: row.appNo })
  // 成功提示
  ElMessage({ message: '重置成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 删除应用
 */
const deleteApp = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定删除？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除应用
  await ApplicationService.deleteApplication({ appNo: row.appNo })
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 打开编辑对话框
 */
const openModifyForm = (row) => {
  showModifyForm.value = true
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

:deep(.el-table__cell) {
  .el-button + .el-button {
    margin-left: 0;
  }
}

:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>

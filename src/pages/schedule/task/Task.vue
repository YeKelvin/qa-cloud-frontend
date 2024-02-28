<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.jobNo" label="作业编号" />
        <ConditionInput v-model="queryConditions.jobName" label="作业名称" />
        <ConditionSelect v-model="queryConditions.jobType" :options="JobType" label="作业类型" />
        <ConditionSelect v-model="queryConditions.triggerType" :options="TriggerType" label="触发类型" />
        <ConditionSelect v-model="queryConditions.state" :options="JobState" label="状态" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" :icon="Search" @click="query()">查 询</el-button>
          <el-button :icon="Refresh" @click="resetQueryConditions()">重 置</el-button>
        </div>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog()">新 增</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="jobNo" label="作业编号" min-width="180" width="180" />
        <el-table-column prop="jobName" label="作业名称" min-width="150">
          <template #default="{ row }">
            <el-tag v-if="row.triggerType == 'DATE'" disable-transitions>once</el-tag>
            <el-tag v-else type="danger" disable-transitions>loop</el-tag>
            <span style="margin-left: 10px">{{ row.jobName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="jobType" label="作业类型" min-width="100" width="100">
          <template #default="{ row }">{{ JobType[row.jobType] }}</template>
        </el-table-column>
        <el-table-column prop="triggerType" label="触发类型" min-width="100" width="100">
          <template #default="{ row }">{{ TriggerType[row.triggerType] }}</template>
        </el-table-column>
        <el-table-column prop="state" label="状态" min-width="80" width="80">
          <template #default="{ row }">{{ JobState[row.state] }}</template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="180" width="180">
          <template #default="{ row }">
            {{ row.createdTime ? dayjs(row.createdTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="200" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetailDialog(row)">详情</el-button>
            <template v-if="row.state != 'CLOSED'">
              <el-button type="primary" link @click="openModifyDialog(row)">编辑</el-button>
            </template>
            <template v-if="row.state == 'NORMAL'">
              <el-button type="primary" link @click="pauseTask(row)">暂停</el-button>
            </template>
            <template v-if="row.state == 'PAUSED'">
              <el-button type="primary" link @click="resumeTask(row)">恢复</el-button>
            </template>
            <template v-if="row.state != 'CLOSED'">
              <el-button type="primary" link @click="removeTask(row)">关闭</el-button>
            </template>
            <el-button type="primary" link @click="openHistoryDialog(row)">历史</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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

    <!-- 任务表单 -->
    <TaskFormDialog
      v-if="showFormDialog"
      v-model="showFormDialog"
      :edit-mode="dialogArgs.editMode"
      :data="dialogArgs.data"
      @re-query="query"
    />

    <!-- 任务历史 -->
    <TaskHistoryDialog v-if="showHistoryDialog" v-model="showHistoryDialog" />
  </div>
</template>

<script setup>
import * as ScheduleService from '@/api/schedule/task'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { JobState, JobType, TriggerType } from '@/api/enum'
import { useWorkspaceStore } from '@/store/workspace'
import useQueryConditions from '@/composables/useQueryConditions'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import TaskFormDialog from './TaskFormDialog.vue'
import TaskHistoryDialog from './TaskHistoryDialog.vue'
import dayjs from 'dayjs'

const workspaceStore = useWorkspaceStore()

const { queryConditions, resetQueryConditions } = useQueryConditions({
  workspaceNo: workspaceStore.workspaceNo,
  jobNo: '',
  jobName: '',
  jobDesc: '',
  jobType: '',
  triggerType: '',
  state: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref(null)
const showFormDialog = ref(false)
const showHistoryDialog = ref(false)
const dialogArgs = reactive({
  editMode: null,
  data: {}
})

provide('currentRow', currentRow)

watch(
  () => workspaceStore.workspaceNo,
  (val) => {
    if (val) query()
  }
)

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  ScheduleService.queryTaskList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then((response) => {
    tableData.value = response.data.list
    total.value = response.data.total
  })
}

/**
 * 暂停作业
 */
const pauseTask = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('确定暂停吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 暂停作业
  await ScheduleService.pauseTask({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: `暂停作业成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 恢复作业
 */
const resumeTask = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('确定恢复吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 恢复作业
  await ScheduleService.resumeTask({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: `恢复作业成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 关闭作业
 */
const removeTask = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('确定关闭吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 关闭作业
  await ScheduleService.removeTask({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: '关闭作业成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 打开详情对话框
 */
const openCreateDialog = (row) => {
  dialogArgs.editMode = 'CREATE'
  dialogArgs.data = null
  showFormDialog.value = true
}

/**
 * 打开详情对话框
 */
const openDetailDialog = (row) => {
  dialogArgs.editMode = 'QUERY'
  dialogArgs.data = row
  showFormDialog.value = true
}

/**
 * 打开编辑对话框
 */
const openModifyDialog = (row) => {
  dialogArgs.editMode = 'MODIFY'
  dialogArgs.data = row
  showFormDialog.value = true
}

/**
 * 打开历史对话框
 */
const openHistoryDialog = (row) => {
  currentRow.value = row
  showHistoryDialog.value = true
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

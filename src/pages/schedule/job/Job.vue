<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.jobNo" label="作业编号" />
        <ConditionInput v-model="queryConditions.jobName" label="作业名称" />
        <ConditionSelect v-model="queryConditions.jobType" :options="JobType" label="作业类型" />
        <ConditionSelect v-model="queryConditions.jobState" :options="JobState" label="作业状态" />
        <ConditionSelect v-model="queryConditions.triggerType" :options="TriggerType" label="触发类型" />
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
        <el-table-column prop="jobNo" label="作业编号" min-width="200" width="200" />
        <el-table-column prop="jobName" label="作业名称" min-width="150" />
        <el-table-column prop="jobType" label="作业对象" min-width="200">
          <template #default="{ row }">
            <el-tag type="warning" style="font-size: 14px" disable-transitions>
              {{ JobType[row.jobType] }}（{{ row.jobArgs.name }}）
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="triggerType" label="触发类型" min-width="100" width="100">
          <template #default="{ row }">{{ TriggerType[row.triggerType] }}</template>
        </el-table-column>
        <el-table-column prop="jobState" label="作业状态" min-width="100" width="100">
          <template #default="{ row }">
            <el-tag :type="row.jobState === 'CLOSED' ? 'info' : 'primary'" style="font-size: 14px" disable-transitions>
              {{ JobState[row.jobState] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="180" width="180" />
        <el-table-column prop="nextRunTime" label="下次运行时间" min-width="180" width="180">
          <template #default="{ row }">
            <el-tag type="danger" style="font-size: 14px" disable-transitions>{{ row.nextRunTime }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="200" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="openJobDetails(row)">详情</el-button>
            <template v-if="row.jobState == 'NORMAL'">
              <el-button type="primary" link @click="pauseJob(row)">暂停</el-button>
            </template>
            <template v-if="row.jobState == 'PAUSED'">
              <el-button type="primary" link @click="resumeJob(row)">恢复</el-button>
            </template>
            <template v-if="row.jobState != 'CLOSED'">
              <el-button type="primary" link @click="removeJob(row)">关闭</el-button>
            </template>
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
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
    </div>

    <!-- 任务表单 -->
    <JobInfoDialog v-if="showingDetails" v-model="showingDetails" @re-query="query" />
  </div>
</template>

<script setup>
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import JobInfoDialog from './JobInfoDialog.vue'

import { JobState, JobType, TriggerType } from '@/api/enum'
import * as ScheduleService from '@/api/schedule/job'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import { useWorkspaceStore } from '@/store/workspace'

const workspaceStore = useWorkspaceStore()

const { queryConditions, resetQueryConditions } = useQueryConditions({
  workspaceNo: workspaceStore.workspaceNo,
  jobNo: '',
  jobName: '',
  jobDesc: '',
  jobType: '',
  jobState: '',
  triggerType: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref(null)
const showingDetails = ref(false)

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
  ScheduleService.queryJobList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then((response) => {
    tableData.value = response.data.list
    total.value = response.data.total
  })
}

/**
 * 暂停作业
 */
const pauseJob = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定暂停？', '警告', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 暂停作业
  await ScheduleService.pauseJob({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: `暂停作业成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 恢复作业
 */
const resumeJob = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定恢复？', '警告', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 恢复作业
  await ScheduleService.resumeJob({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: `恢复作业成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 关闭作业
 */
const removeJob = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定关闭？', '警告', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 关闭作业
  await ScheduleService.removeJob({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: '关闭作业成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 打开详情对话框
 */
const openCreateDialog = () => {
  currentRow.value = null
  showingDetails.value = true
}

/**
 * 打开详情对话框
 */
const openJobDetails = (row) => {
  currentRow.value = row
  showingDetails.value = true
}

const onSizeChange = (val) => {
  pageSize.value = val
  query()
}

const onCurrentChange = (val) => {
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

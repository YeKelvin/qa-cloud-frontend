<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.logNo" label="日志编号" />
        <ConditionInput v-model="queryConditions.jobNo" label="作业编号" />
        <ConditionInput v-model="queryConditions.jobName" label="作业名称" />
        <ConditionSelect v-model="queryConditions.jobType" :options="JobType" label="作业类型" />
        <ConditionSelect v-model="queryConditions.jobEvent" :options="JobEvent" label="操作类型" />
      </div>
      <div style="display: flex; justify-content: center">
        <el-button type="primary" :icon="Search" @click="query()">查 询</el-button>
        <el-button :icon="Refresh" @click="resetQueryConditions()">重 置</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="logNo" label="日志编号" min-width="280" width="280" />
        <el-table-column prop="jobNo" label="作业编号" min-width="200" width="200" />
        <el-table-column prop="jobName" label="作业名称" min-width="150" />
        <el-table-column prop="jobType" label="作业对象" min-width="250">
          <template #default="{ row }">
            <el-tag type="warning" style="font-size: 14px" disable-transitions>
              {{ JobType[row.jobType] }}（{{ row.jobArgs.name }}）
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="jobEvent" label="操作类型" min-width="120" width="120">
          <template #default="{ row }">
            <el-tag :type="JobEventColor[row.jobEvent]" style="font-size: 14px" disable-transitions>
              {{ JobEvent[row.jobEvent] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationBy" label="操作人" min-width="100" />
        <el-table-column prop="operationTime" label="操作时间" min-width="180" width="180">
          <template #default="{ row }">
            {{ row.operationTime ? dayjs(row.operationTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
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
  </div>
</template>

<script setup>
import { Search, Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

import { JobType, JobEvent, JobEventColor } from '@/api/enum'
import * as ScheduleService from '@/api/schedule/job'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import { useWorkspaceStore } from '@/store/workspace'

const workspaceStore = useWorkspaceStore()

const { queryConditions, resetQueryConditions } = useQueryConditions({
  logNo: '',
  jobNo: '',
  jobName: '',
  jobType: '',
  jobEvent: '',
  startTime: '',
  endTime: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

watch(
  () => workspaceStore.workspaceNo,
  (val) => {
    if (val) query()
  }
)

onMounted(() => {
  query()
})

const query = () => {
  ScheduleService.queryJobLogList({
    workspaceNo: workspaceStore.workspaceNo,
    ...queryConditions,
    page: page.value,
    pageSize: pageSize.value
  }).then((response) => {
    tableData.value = response.data.list
    total.value = response.data.total
  })
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

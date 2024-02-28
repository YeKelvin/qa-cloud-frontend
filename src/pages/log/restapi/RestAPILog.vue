<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionDatetimePicker v-model="queryConditions.startTime" label="开始时间" />
        <ConditionDatetimePicker v-model="queryConditions.endTime" label="结束时间" />
        <ConditionSelect
          v-model="queryConditions.method"
          :options="{ POST: 'POST', PUT: 'PUT', DELETE: 'DELETE' }"
          label="请求方法"
        />
        <ConditionInput v-model="queryConditions.path" label="请求路径" />
        <ConditionInput v-model="queryConditions.request" label="请求数据" />
        <ConditionInput v-model="queryConditions.response" label="响应数据" />
        <ConditionSelect
          v-model="queryConditions.success"
          :options="{ true: '成功', false: '失败' }"
          label="响应状态"
        />
        <ConditionInput v-model="queryConditions.invokeBy" label="请求人" />
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
        <el-table-column prop="method" label="请求方法" min-width="100" width="100" />
        <el-table-column prop="path" label="请求路由" min-width="150" />
        <el-table-column prop="desc" label="请求描述" min-width="150" />
        <el-table-column prop="success" label="响应状态" min-width="150">
          <template #default="{ row }">{{ row.success == true ? '成功' : '失败' }}</template>
        </el-table-column>
        <el-table-column prop="elapsedTime" label="响应耗时" min-width="150">
          <template #default="{ row }">{{ row.elapsedTime }} ms</template>
        </el-table-column>
        <el-table-column prop="invokeBy" label="请求人" min-width="150" width="150" />
        <el-table-column prop="invokeIp" label="请求IP" min-width="150" width="150" />
        <el-table-column prop="invokeTime" label="请求时间" min-width="180" width="180" />
        <el-table-column fixed="right" label="操作" min-width="80" width="80" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openLogDetails(row)">详情</el-button>
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

    <!-- 日志详情 -->
    <LogDetails v-if="showLogDetails" v-model="showLogDetails" />
  </div>
</template>

<script setup>
import * as LogService from '@/api/system/log'
import ConditionDatetimePicker from '@/components/query-condition/ConditionDatetimePicker.vue'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import { Refresh, Search } from '@element-plus/icons-vue'
import LogDetails from './RestAPILogDetails.vue'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  invoker: '',
  method: '',
  path: '',
  request: '',
  response: '',
  success: '',
  startTime: '',
  endTime: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref({})
const showLogDetails = ref(false)

provide('currentRow', currentRow)

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  LogService.queryRestAPILogList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then(
    (response) => {
      tableData.value = response.data.list
      total.value = response.data.total
    }
  )
}

/**
 * 打开日志详情
 */
const openLogDetails = (row) => {
  showLogDetails.value = true
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

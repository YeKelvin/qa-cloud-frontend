<template>
  <el-dialog title="任务历史" width="80%" center @close="$emit('update:model-value', false)">
    <el-table :data="tableData" style="width: 100%; height: 100%" fit stripe highlight-current-row>
      <!-- 空数据提示 -->
      <template #empty><el-empty /></template>
      <!-- 列定义 -->
      <el-table-column prop="operationType" label="操作类型" min-width="120" width="120">
        <template #default="{ row }">{{ TaskOperationType[row.operationType] }}</template>
      </el-table-column>
      <el-table-column prop="operationContent" label="操作内容" min-width="150" />
      <el-table-column prop="operationBy" label="操作人" min-width="160" width="160" />
      <el-table-column prop="operationTime" label="操作时间" min-width="180" width="180">
        <template #default="{ row }">
          {{ row.operationTime ? dayjs(row.operationTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
    </el-table>

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
  </el-dialog>
</template>

<script setup>
import * as ScheduleService from '@/api/schedule/task'
import { TaskOperationType } from '@/api/enum'
import useQueryConditions from '@/composables/useQueryConditions'
import dayjs from 'dayjs'

const emit = defineEmits(['update:model-value'])
const currentRow = inject('currentRow', null)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const { queryConditions, resetQueryConditions } = useQueryConditions({
  jobNo: '',
  startTime: '',
  endTime: ''
})

onMounted(() => {
  queryConditions.jobNo = currentRow.value.jobNo
  query()
})

/**
 * 查询
 */
const query = () => {
  ScheduleService.queryTaskHistoryList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then(
    (response) => {
      tableData.value = response.result.data
      total.value = response.result.total
    }
  )
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
.pagination-container {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  padding: 10px 0;
  padding-right: 10px;
}
</style>

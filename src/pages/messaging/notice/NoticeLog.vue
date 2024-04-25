<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionDatetimePicker v-model="queryConditions.startTime" label="开始时间" />
        <ConditionDatetimePicker v-model="queryConditions.endTime" label="结束时间" />
        <ConditionInput v-model="queryConditions.logNo" label="日志编号" />
        <ConditionSelect v-model="queryConditions.event" :options="NoticeEvent" label="触发事件" />
        <ConditionSelect v-model="queryConditions.channel" :options="NoticeChannel" label="通知渠道" />
        <ConditionSelect
          v-model="queryConditions.success"
          :options="{ true: '成功', false: '失败' }"
          label="发送状态"
        />
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
        <el-table-column prop="event" label="触发事件" min-width="150">
          <template #default="{ row }">
            <el-tag type="warning" style="font-size: 14px" disable-transitions>
              {{ NoticeEvent[row.event] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="通知渠道" min-width="80">
          <template #default="{ row }">
            <el-tag type="primary" style="font-size: 14px" disable-transitions>
              {{ NoticeChannel[row.channel] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="通知内容" min-width="250">
          <template #default="{ row }">
            <el-text truncated line-clam="2">{{ row.content }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="success" label="发送状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="row.success == true ? 'success' : 'danger'" style="font-size: 14px" disable-transitions>
              {{ row.success == true ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notifiedTime" label="发送时间" min-width="120">
          <template #default="{ row }">{{ row.notifiedTime }}</template>
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
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { Search, Refresh } from '@element-plus/icons-vue'

import { NoticeEvent, NoticeChannel } from '@/api/enum'
import * as NoticeService from '@/api/messaging/notice'
import ConditionDatetimePicker from '@/components/query-condition/ConditionDatetimePicker.vue'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import { useWorkspaceStore } from '@/store/workspace'

const workspaceStore = useWorkspaceStore()

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  logNo: '',
  event: '',
  channel: '',
  success: '',
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

/**
 * 查询
 */
const query = () => {
  NoticeService.queryNoticeLogList({
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

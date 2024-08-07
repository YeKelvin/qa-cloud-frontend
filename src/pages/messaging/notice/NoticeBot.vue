<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.botNo" label="机器人编号" />
        <ConditionInput v-model="queryConditions.botName" label="机器人名称" />
        <ConditionInput v-model="queryConditions.botDesc" label="机器人描述" />
        <ConditionSelect v-model="queryConditions.botType" :options="NoticeBotType" label="机器人类型" />
        <ConditionSelect v-model="queryConditions.state" :options="NoticeBotState" label="机器人状态" />
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
        <el-table-column prop="botNo" label="机器人编号" min-width="200" width="200" />
        <el-table-column prop="botName" label="机器人名称" min-width="150" />
        <el-table-column prop="botDesc" label="机器人描述" min-width="150" />
        <el-table-column prop="botType" label="机器人类型" min-width="120" width="120">
          <template #default="{ row }">
            <el-tag type="primary" style="font-size: 14px" disable-transitions>
              {{ NoticeBotType[row.botType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" min-width="80" width="80">
          <template #default="{ row }">
            <el-tag :type="row.state === 'ENABLE' ? 'primary' : 'warning'" style="font-size: 14px" disable-transitions>
              {{ NoticeBotState[row.state] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="160" width="160">
          <template #default="{ row }">
            <el-button type="primary" link @click="openModifyDialog(row)">编辑</el-button>
            <template v-if="row.state === 'ENABLE'">
              <el-button type="primary" link @click="modifyBotState(row, 'DISABLE')">禁用</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link @click="modifyBotState(row, 'ENABLE')">启用</el-button>
            </template>
            <el-button type="danger" link @click="removeBot(row)">删除</el-button>
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

    <!-- 创建机器人表单 -->
    <BotCreateDialog v-if="showCreateDialog" v-model="showCreateDialog" @re-query="query" />
    <!-- 编辑机器人表单 -->
    <BotModifyDialog v-if="showModifyDialog" v-model="showModifyDialog" @re-query="query" />
  </div>
</template>

<script setup>
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import BotCreateDialog from './NoticeBotCreateDialog.vue'
import BotModifyDialog from './NoticeBotModifyDialog.vue'

import { NoticeBotState, NoticeBotType } from '@/api/enum'
import * as NoticeService from '@/api/messaging/notice'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import { useWorkspaceStore } from '@/store/workspace'

const workspaceStore = useWorkspaceStore()
const { queryConditions, resetQueryConditions } = useQueryConditions({
  botNo: '',
  botName: '',
  botDesc: '',
  botType: '',
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
  NoticeService.queryNoticeBotList({
    workspaceNo: workspaceStore.workspaceNo,
    ...queryConditions,
    page: page.value,
    pageSize: pageSize.value
  }).then((response) => {
    tableData.value = response.data.list
    total.value = response.data.total
  })
}

/**
 * 修改机器人状态
 */
const modifyBotState = async (row, state) => {
  const stateMsg = state === 'DISABLE' ? '禁用' : '启用'
  // 二次确认
  const cancelled = await ElMessageBox.confirm(`是否确定${stateMsg}？`, '警告', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 修改机器人状态
  await NoticeService.modifyNoticeBotState({ botNo: row.botNo, state: state })
  // 成功提示
  ElMessage({ message: `${stateMsg}机器人成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 删除机器人
 */
const removeBot = async (row) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定删除？', '警告', {
    type: 'error',
    confirmButtonText: '确 定',
    cancelButtonText: '取 消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除机器人
  await NoticeService.removeNoticeBot({ botNo: row.botNo })
  // 成功提示
  ElMessage({ message: '删除机器人成功', type: 'info', duration: 2 * 1000 })
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

const handleSizeChange = (val) => {
  pageSize.value = val
  query()
}

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

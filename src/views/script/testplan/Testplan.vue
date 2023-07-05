<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.planNo" label="计划编号" />
        <ConditionInput v-model="queryConditions.planName" label="计划名称" />
        <ConditionInput v-model="queryConditions.scrumVersion" label="版本" />
        <ConditionInput v-model="queryConditions.scrumSprint" label="迭代" />
        <ConditionSelect v-model="queryConditions.testPhase" :options="TestPhase" label="测试阶段" />
        <ConditionSelect v-model="queryConditions.state" :options="TestplanState" label="计划状态" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" :icon="Search" @click="queryList()">查询</el-button>
          <el-button :icon="Refresh" @click="resetQueryConditions()">重置</el-button>
        </div>
        <el-button type="primary" :icon="Plus" @click="gotoTestplanEditor(null)">创建测试计划</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="planNo" label="计划编号" min-width="180" width="180" />
        <el-table-column prop="planName" label="计划名称" min-width="150">
          <template #default="{ row }">{{ row.planName }} ({{ row.collectionTotal }})</template>
        </el-table-column>
        <el-table-column prop="scrumVersion" label="版本" min-width="150" />
        <el-table-column prop="scrumSprint" label="迭代" min-width="150" />
        <el-table-column prop="testPhase" label="测试阶段" min-width="150" width="150">
          <template #default="{ row }">
            <span style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ TestPhase[row.testPhase] }}</span>
              <el-popover
                :ref="
                  (el) => {
                    if (el) testphasePopoverRefs[row.planNo] = el
                  }
                "
                trigger="click"
                placement="bottom"
                width="300"
              >
                <span style="display: flex; justify-content: space-between; align-items: center">
                  <el-select
                    v-model="row.tobeModifiedTestPhase"
                    style="width: 100%; margin-right: 10px"
                    :teleported="false"
                  >
                    <el-option v-for="(value, key) in TestPhase" :key="key" :label="value" :value="key" />
                  </el-select>
                  <el-button type="danger" @click="modifyTestplanTestphase(row)">保存</el-button>
                </span>
                <template #reference>
                  <el-button
                    v-if="row.testPhase && row.testPhase != 'COMPLETED'"
                    :icon="Edit"
                    type="danger"
                    size="small"
                    circle
                    plain
                  />
                  <el-button v-else type="danger" size="small" style="width: 100%" plain round>设置阶段</el-button>
                </template>
              </el-popover>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="计划状态" min-width="150" width="150">
          <template #default="{ row }">
            <span style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ TestplanState[row.state] }}</span>
              <el-popover
                :ref="
                  (el) => {
                    if (el) statePopoverRefs[row.planNo] = el
                  }
                "
                trigger="click"
                placement="bottom"
                width="300"
              >
                <span style="display: flex; justify-content: space-between; align-items: center">
                  <el-select
                    v-model="row.tobeModifiedState"
                    style="width: 100%; margin-right: 10px"
                    :teleported="false"
                  >
                    <el-option v-for="(value, key) in TestplanState" :key="key" :label="value" :value="key" />
                  </el-select>
                  <el-button type="danger" @click="modifyTestplanState(row)">保存</el-button>
                </span>
                <template #reference>
                  <el-button v-if="row.state != 'COMPLETED'" :icon="Edit" type="danger" size="small" circle plain />
                </template>
              </el-popover>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" min-width="160" width="160">
          <template #default="{ row }">
            {{ row.startTime ? dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" min-width="160" width="160">
          <template #default="{ row }">
            {{ row.endTime ? dayjs(row.endTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="160" width="160">
          <template #default="{ row }">
            {{ dayjs(row.createdTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column prop="createdBy" label="创建人" min-width="150" width="150" />
        <el-table-column fixed="right" label="操作" min-width="250" width="250">
          <template #default="{ row }">
            <template v-if="row.state != 'COMPLETED'">
              <el-button type="primary" link style="margin-left: 12px" @click="gotoTestplanEditor(row.planNo, 'QUERY')">
                查看详情
              </el-button>
              <el-button type="primary" link @click="openExecutionRecordDialog(row)">执行记录</el-button>
              <el-button type="primary" link style="color: #f56c6c; font-weight: bold" @click="executeTestplan(row)">
                立即执行
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" link style="margin-left: 12px" @click="openExecutionRecordDialog(row)">
                执行记录
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 翻页组件 -->
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

    <TestplanExecutionRecordDialog v-if="showRecordDialog" v-model="showRecordDialog" :plan-no="currentRowPlanNo" />
  </div>
</template>

<script lang="jsx" setup>
import * as ExecutionService from '@/api/script/execution'
import * as TestplanService from '@/api/script/testplan'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Edit, Search, Refresh, Plus } from '@element-plus/icons-vue'
import { TestplanState, TestPhase } from '@/api/enum'
import { useWorkspaceStore } from '@/store/workspace'
import useQueryConditions from '@/composables/useQueryConditions'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import TestplanDatasetSelect from './TestplanDatasetSelect.vue'
import TestplanExecutionRecordDialog from './TestplanExecutionRecordDialog.vue'
import dayjs from 'dayjs'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  planNo: '',
  planName: '',
  scrumSprint: '',
  scrumVersion: '',
  testPhase: '',
  state: ''
})
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showRecordDialog = ref(false)
const currentRowPlanNo = ref('')
const testphasePopoverRefs = ref([])
const statePopoverRefs = ref([])

watch(
  () => workspaceStore.workspaceNo,
  () => queryList()
)

onMounted(() => {
  queryList()
})

// 确保在每次更新之前重置ref
onBeforeUpdate(() => {
  testphasePopoverRefs.value = []
  statePopoverRefs.value = []
})

/**
 * 查询
 */
const queryList = () => {
  TestplanService.queryTestplanList({
    ...queryConditions,
    workspaceNo: workspaceStore.workspaceNo,
    page: page.value,
    pageSize: pageSize.value
  }).then((response) => {
    tableData.value = response.result.data
    total.value = response.result.total
  })
}

/**
 * 执行测试计划
 */
const executeTestplan = async ({ planNo, planName }) => {
  let datasets = []
  let useCurrentValue = false
  // 弹出选择变量集的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择测试环境',
    message: (
      <TestplanDatasetSelect
        key={new Date().getTime()}
        workspaceNo={workspaceStore.workspaceNo}
        planName={planName}
        onChangeDatasets={(val) => (datasets = val)}
        onChangeUseCurrentValue={(val) => (useCurrentValue = val)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 异步执行测试计划
  const response = await ExecutionService.executeTestPlan({
    planNo: planNo,
    datasets: datasets,
    useCurrentValue: useCurrentValue
  })
  // 成功提示
  ElNotification.success({
    message: `开始执行测试计划，总 ${response.result.total} 个脚本，请稍等片刻`,
    duration: 2 * 1000
  })
}

/**
 * 修改测试阶段
 */
const modifyTestplanTestphase = ({ planNo, tobeModifiedTestPhase }) => {
  if (!tobeModifiedTestPhase || tobeModifiedTestPhase === '') {
    // 错误提示
    ElMessage({ message: '无效的测试阶段', type: 'error', duration: 2 * 1000 })
    // 关闭popover
    testphasePopoverRefs.value[planNo].hide()
    return
  }
  // 修改测试阶段
  TestplanService.modifyTestplanTestphase({ planNo: planNo, testPhase: tobeModifiedTestPhase })
    .then(() => {
      // 重新查询列表
      queryList()
    })
    .finally(() => {
      // 关闭popover
      testphasePopoverRefs.value[planNo].hide()
    })
}

/**
 * 修改计划状态
 */
const modifyTestplanState = ({ planNo, tobeModifiedState }) => {
  if (!tobeModifiedState || tobeModifiedState === '') {
    // 错误提示
    ElMessage({ message: '无效的状态', type: 'error', duration: 2 * 1000 })
    // 关闭popover
    statePopoverRefs.value[planNo].hide()
    return
  }
  // 修改计划状态
  TestplanService.modifyTestplanState({ planNo: planNo, state: tobeModifiedState })
    .then(() => {
      // 重新查询列表
      queryList()
    })
    .finally(() => {
      // 关闭popover
      statePopoverRefs.value[planNo].hide()
    })
}

/**
 * 跳转至测试计划 新增/编辑 页
 */
const gotoTestplanEditor = (planNo, editorMode) => {
  router.push({
    name: 'TestplanEditor',
    path: 'testplan/editor',
    query: {
      planNo: planNo,
      editorMode: planNo ? editorMode : 'CREATE'
    }
  })
}

/**
 * 打开执行记录对话框
 */
const openExecutionRecordDialog = ({ planNo }) => {
  currentRowPlanNo.value = planNo
  showRecordDialog.value = true
}

/**
 * pagination handler
 */
const handleSizeChange = (val) => {
  pageSize.value = val
  queryList()
}

/**
 * pagination handler
 */
const handleCurrentChange = (val) => {
  page.value = val
  queryList()
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
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
  padding-right: 10px;
}

:deep(.el-card__header) {
  padding: 10px 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>

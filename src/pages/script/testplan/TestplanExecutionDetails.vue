<template>
  <div class="scrollbar details-container">
    <!-- 顶部区域 -->
    <div style="display: flex; margin-bottom: 10px">
      <!-- 执行进度 -->
      <el-card shadow="hover" style="width: 50%; margin-right: 10px">
        <template #header><span>执行进度</span></template>
        <div style="display: flex; flex: 1; place-content: center center; align-items: center">
          <el-progress type="circle" :percentage="percentage" :width="160" />
        </div>
      </el-card>

      <!-- 计划设置 -->
      <div style="display: flex; flex: 1; flex-direction: column; width: 50%">
        <!-- 配置项 -->
        <el-card shadow="hover" style="height: 100%; margin-bottom: 10px">
          <template #header><span>配置项</span></template>
          <div class="settings-container">
            <el-tag v-if="details.save" disable-transitions>保存测试报告</el-tag>
            <el-tag v-if="details.saveOnError" disable-transitions>仅保存失败结果</el-tag>
            <el-tag v-if="details.useCurrentValue" disable-transitions>使用变量当前值</el-tag>
            <el-tag v-else disable-transitions>不使用变量当前值</el-tag>
            <el-tag disable-transitions>共 {{ details.concurrency }} 个并发</el-tag>
            <el-tag disable-transitions>循环执行 {{ details.iterations }} 次</el-tag>
            <el-tag disable-transitions>间隔等待 {{ details.delay }} ms</el-tag>
          </div>
        </el-card>
        <!-- 环境/变量 -->
        <el-card v-if="!isEmpty(details.datasetList)" shadow="hover" style="height: 100%">
          <template #header><span>环境/变量</span></template>
          <div class="settings-container">
            <el-tag v-for="dataset in details.datasetList" :key="dataset.datasetNo" disable-transitions>
              {{ dataset.datasetName }}
            </el-tag>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 计划项目详情 -->
    <el-card shadow="hover" style="width: 100%">
      <template #header><span>执行详情</span></template>
      <el-table :data="tableData" stripe fit highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>

        <!-- 列定义 -->
        <el-table-column type="index" label="序号" align="center" width="60px" min-width="60px" />
        <el-table-column prop="elementNo" label="元素编号" />
        <el-table-column prop="elementName" label="集合名称" />
        <el-table-column v-if="details.reportNo" prop="runningState" label="执行状态">
          <template #default="{ row }">{{ RunningState[row.runningState] }}</template>
        </el-table-column>
        <el-table-column v-if="details.reportNo" prop="success" label="执行结果">
          <template #default="{ row }">
            <template v-if="row.success == null">{{ '' }}</template>
            <template v-else>{{ row.success ? '成功' : '失败' }}</template>
          </template>
        </el-table-column>
        <template v-if="details.reportNo">
          <el-table-column prop="startTime" label="开始时间">
            <template #default="{ row }">
              {{ row.startTime ? dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间">
            <template #default="{ row }">
              {{ row.endTime ? dayjs(row.endTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </template>
          </el-table-column>
          <el-table-column prop="elapsedTime" label="耗时" />
        </template>
        <template v-if="details.iterations > 1">
          <el-table-column prop="iterationCount" label="迭代次数" />
          <el-table-column prop="successCount" label="成功次数" />
          <el-table-column prop="failureCount" label="失败次数" />
          <el-table-column prop="errorCount" label="异常次数" />
        </template>
      </el-table>
    </el-card>

    <!-- 按钮 -->
    <div class="btn-wrapper">
      <el-button v-if="details.reportNo" type="primary" :icon="DataAnalysis" @click="openReport()">报 告</el-button>
      <el-button style="margin-left: 10px" :icon="Back" @click="goBack()">返 回</el-button>
    </div>
  </div>
</template>

<script setup>
import { Back, DataAnalysis } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash-es'

import { RunningState } from '@/api/enum'
import * as TestplanService from '@/api/script/testplan'

const route = useRoute()
const router = useRouter()
const executionNo = ref(route.query.executionNo)
const details = ref({})
const tableData = ref([])
const percentage = computed(() => {
  if (details.value.iterations > 1) {
    // 统计迭代的进度
    const percentage = details.value.iterationCount / details.value.iterations
    if (!percentage) return 0
    return Number.parseInt(percentage * 100)
  } else {
    // 统计执行进度（需要保存测试报告的计划）
    const total = tableData.value.length
    let completedTotal = 0
    for (const item of tableData.value) {
      if (item.runningState === 'COMPLETED' || item.runningState === 'ERROR') {
        completedTotal += 1
      }
    }
    const percentage = completedTotal / total
    if (!percentage) return 0
    return Number.parseInt(percentage * 100)
  }
})

onMounted(() => {
  if (!executionNo.value) {
    goBack()
    return
  }
  queryTestplanExecutionDetails()
})

const queryTestplanExecutionDetails = () => {
  TestplanService.queryTestplanExecutionDetails({ executionNo: executionNo.value }).then(response => {
    details.value = response.data
    tableData.value = response.data.collectionList
  })
}

/**
 * 跳转至测试报告页
 */
const openReport = () => {
  router.push({ path: '/script/report', query: { reportNo: details.value.reportNo } })
}

/**
 * 返回上一页
 */
const goBack = () => {
  globalThis.history.length > 1 ? router.go(-1) : router.push('/')
}
</script>

<style lang="scss" scoped>
.details-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px;
}

.settings-container {
  display: flex;
  flex-wrap: wrap;
  place-content: center center;
  align-items: center;

  .el-tag {
    margin: 5px;
  }
}

.btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-card__body) {
  display: flex;
  padding: 10px;
}
</style>

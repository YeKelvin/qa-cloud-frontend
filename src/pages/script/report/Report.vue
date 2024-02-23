<template>
  <div class="report-container">
    <!-- 报告标题 -->
    <div class="report-header">
      <el-card shadow="hover">
        <el-button type="primary" link :icon="ArrowLeft" @click="goBack()">返 回</el-button>
        <span style="font-size: 16px">接口测试报告</span>
        <el-button type="primary" link :icon="DataAnalysis" @click="openOverview()">统 计</el-button>
      </el-card>
    </div>

    <!-- 报告主体 -->
    <div class="report-body">
      <!-- collection-card 列表 -->
      <el-card shadow="hover" class="collection-container">
        <!-- 卡片头部 -->
        <template #header><span style="font-size: 16px">测试脚本</span></template>
        <!-- 过滤input -->
        <el-input
          v-model="collectionsFilterText"
          placeholder="搜索脚本"
          style="padding: 10px 10px 0; margin-bottom: 10px"
          clearable
        />
        <!-- collection-card -->
        <el-scrollbar
          style="width: 100%; height: 100%; padding-bottom: 50px"
          wrap-style="overflow-x:auto;"
          view-style="padding: 0 10px;"
        >
          <ReportCollectionCard :collections="filteredCollections" @click="handleCollectionCardClick" />
        </el-scrollbar>
      </el-card>

      <!-- element-tree -->
      <el-card v-show="showTree" shadow="hover" class="result-tree-container">
        <!-- 卡片头部 -->
        <template #header><span style="font-size: 16px">测试用例</span></template>
        <!-- 过滤input -->
        <el-input
          v-model="resultTreeFilterText"
          placeholder="搜索"
          style="padding: 10px 10px 0; margin-bottom: 10px"
          clearable
        />
        <!-- 脚本结果列表 -->
        <el-scrollbar
          style="width: 100%; height: 100%; padding-bottom: 50px"
          wrap-style="overflow-x:auto;"
          view-style="padding: 0 10px;"
        >
          <ReportResultTree :data="workers" :filter-text="resultTreeFilterText" @node-click="handleNodeClick" />
        </el-scrollbar>
      </el-card>

      <!-- ResultDetails -->
      <el-card shadow="hover" class="result-details-container">
        <!-- 卡片头部 -->
        <template #header>
          <div class="flexbox-between">
            <span style="font-size: 16px">请求详情</span>
            <el-button
              v-show="showSamplerResult"
              style="font-size: 16px"
              type="primary"
              link
              :icon="CopyDocument"
              @click="samplerResultRef && samplerResultRef.copyAll()"
            />
          </div>
        </template>
        <el-scrollbar
          style="width: 100%; height: 100%; padding-bottom: 50px"
          wrap-style="overflow-x: auto;"
          view-style="padding: 10px;"
        >
          <ReportOverview v-if="showOverview" :overview="overview" />
          <ReportCollectionResult v-if="showCollectionResult" :details="collectionDetails" />
          <ReportWorkerResult v-if="showWorkerResult" :worker-id="workerId" />
          <ReportSamplerResult v-if="showSamplerResult" ref="samplerResultRef" :sampler-id="samplerId" />
        </el-scrollbar>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import * as ReportService from '@/api/script/report'
import { isBlank } from '@/utils/string-util'
import { ArrowLeft, CopyDocument, DataAnalysis } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import ReportCollectionCard from './ReportCollectionCard.vue'
import ReportCollectionResult from './ReportCollectionResult.vue'
import ReportOverview from './ReportOverview.vue'
import ReportResultTree from './ReportResultTree'
import ReportSamplerResult from './ReportSamplerResult.vue'
import ReportWorkerResult from './ReportWorkerResult.vue'

const route = useRoute()
const router = useRouter()
const reportNo = ref(route.query.reportNo)
const overview = ref({})
const collections = ref([])
const workers = ref([])
const collectionId = ref('')
const collectionDetails = ref({})
const workerId = ref('')
const samplerId = ref('')
const collectionsFilterText = ref('')
const resultTreeFilterText = ref('')
const showOverview = ref(true)
const showCollectionResult = ref(false)
const showWorkerResult = ref(false)
const showSamplerResult = ref(false)
const showTree = computed(() => !isEmpty(workers.value))
const samplerResultRef = ref()
const filteredCollections = computed(() => {
  if (isBlank(collectionsFilterText.value)) {
    return collections.value
  } else {
    return collections.value.filter((item) => item.name.indexOf(collectionsFilterText.value.trim()) !== -1)
  }
})

onMounted(() => {
  if (!reportNo.value) {
    goBack()
    return
  }
  queryReport()
})

/**
 * 查询报告
 */
const queryReport = () => {
  ReportService.queryReport({ reportNo: reportNo.value }).then((response) => {
    overview.value = response.result.details
    collections.value = response.result.collections
  })
}

/**
 * 查询集合结果
 */
const queryCollectionResult = () => {
  ReportService.queryCollectionResult({ collectionId: collectionId.value }).then((response) => {
    collectionDetails.value = response.result.details
    workers.value = response.result.children
  })
}

/**
 * 打开统计面板
 */
const openOverview = () => {
  workers.value = []
  showOverview.value = true
  showCollectionResult.value = false
  showWorkerResult.value = false
  showSamplerResult.value = false
}

/**
 * el-card handler
 */
const handleCollectionCardClick = (collection) => {
  // 记录当前点击的 CollectionId
  collectionId.value = collection.id
  // 查询集合结果
  queryCollectionResult()

  // 设置当前显示的结果视图为 CollectionResult
  showOverview.value = false
  showCollectionResult.value = true
  showWorkerResult.value = false
  showSamplerResult.value = false
}

/**
 * el-tree handler
 */
const handleNodeClick = (data, node) => {
  showOverview.value = false
  showCollectionResult.value = false
  if (node.level === 1) {
    // 记录当前点击的 workerId
    workerId.value = data.id
    // 设置当前显示的结果视图为 WorkerResult
    showWorkerResult.value = true
    showSamplerResult.value = false
  } else {
    // 记录当前点击的 SamplerId
    samplerId.value = data.id
    // 设置当前显示的结果视图为 SamplerResult
    showWorkerResult.value = false
    showSamplerResult.value = true
  }
}

/**
 * 返回上一页
 */
const goBack = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/')
}
</script>

<style lang="scss" scoped>
.report-container {
  position: absolute;
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #606266;
}

.report-header {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  margin: 5px 0;

  .el-button {
    padding: 5px;
    font-size: 16px;
  }

  :deep(.el-card__body) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 36px;
  }
}

.report-body {
  display: flex;
  flex: 1;
  width: 100%;
  height: 0;
  padding: 0 10px;
  padding-bottom: 5px;
}

.collection-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 300px;
  max-width: 400px;
  height: 100%;
  margin-right: 10px;
}

.result-tree-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 300px;
  max-width: 400px;
  height: 100%;
  margin-right: 10px;
}

.result-details-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 500px;
}

.el-card {
  color: #606266;
}

:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-card__body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
}

:deep(.el-tree-node__content) {
  height: 100%;
}
</style>

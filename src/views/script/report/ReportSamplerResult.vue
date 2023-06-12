<template>
  <div class="details-container">
    <el-descriptions :column="1">
      <el-descriptions-item label="请求名称：">{{ details.samplerName }}</el-descriptions-item>
      <el-descriptions-item v-if="details.samplerRemark" label="请求描述：">
        {{ details.samplerRemark }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="3">
      <el-descriptions-item label="开始时间：">
        <el-tag type="warning" disable-transitions>{{ details.startTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="结束时间：">
        <el-tag type="warning" disable-transitions>{{ details.endTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="耗时：">
        <el-tag type="danger" disable-transitions>{{ details.elapsedTime }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 请求部分 tabs -->
    <el-tabs v-model="requestActiveTabName" @tab-click="handleRequestTabClick">
      <el-tab-pane key="HEADERS" label="请求头" name="HEADERS" />
      <el-tab-pane key="DATA" label="请求数据" name="DATA" />
    </el-tabs>

    <!-- 请求头 -->
    <div v-show="showRequestHeaders">
      <el-table :data="requestHeadersData" :show-header="false" max-height="300" style="width: 100%">
        <el-table-column prop="name" />
        <el-table-column prop="value" />
      </el-table>
    </div>
    <!-- 请求体 -->
    <div v-show="showRequestData">
      <MonacoEditor ref="requestEditorRef" language="json" style="height: 300px" :read-only="true" />
    </div>

    <!-- 响应部分 -->
    <el-tabs v-model="responseActiveTabName" @tab-click="handleResponseTabClick">
      <el-tab-pane key="HEADERS" label="响应头" name="HEADERS" />
      <el-tab-pane key="DATA" label="响应数据" name="DATA" />
      <el-tab-pane v-if="details.failedAssertion" key="ASSERTION" label="断言" name="ASSERTION" />
    </el-tabs>

    <!-- 响应头 -->
    <div v-show="showResponseHeaders">
      <el-table :data="responseHeadersData" :show-header="false" max-height="300" style="width: 100%">
        <el-table-column prop="name" />
        <el-table-column prop="value" />
      </el-table>
    </div>
    <!-- 响应体 -->
    <div v-show="showResponseData">
      <MonacoEditor ref="responseEditorRef" language="json" style="height: 300px" :read-only="true" />
    </div>
    <!-- 断言 -->
    <div v-show="showResponseAssertion">
      <MonacoEditor ref="assertionEditorRef" language="log" style="height: 300px" :read-only="true" />
    </div>
  </div>
</template>

<script setup>
import * as ReportService from '@/api/script/report'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps({
  samplerId: { type: String, default: '' }
})
const details = ref({})
const requestActiveTabName = ref('DATA')
const responseActiveTabName = ref('DATA')
const showRequestHeaders = computed(() => requestActiveTabName.value == 'HEADERS')
const showRequestData = computed(() => requestActiveTabName.value == 'DATA')
const showResponseHeaders = computed(() => responseActiveTabName.value == 'HEADERS')
const showResponseData = computed(() => responseActiveTabName.value == 'DATA')
const showResponseAssertion = computed(() => responseActiveTabName.value == 'ASSERTION')
const requestHeadersData = computed(() => {
  if (!details.value.requestHeaders) return []
  return getHeadersFromJson(details.value.requestHeaders)
})
const responseHeadersData = computed(() => {
  if (!details.value.responseHeaders) return []
  return getHeadersFromJson(details.value.responseHeaders)
})
const requestEditorRef = ref()
const responseEditorRef = ref()
const assertionEditorRef = ref()
watch(
  () => props.samplerId,
  (val) => {
    if (!val) return
    querySamplerResult()
  }
)

onMounted(() => {
  if (!props.samplerId) return
  querySamplerResult()
})

/**
 * 查询取样器结果
 */
const querySamplerResult = () => {
  ReportService.querySamplerResult({ samplerId: props.samplerId }).then((response) => {
    details.value = response.result
    handleRequestTabClick({ paneName: requestActiveTabName.value })
    handleResponseTabClick({ paneName: responseActiveTabName.value })
  })
}

/**
 * el-tab handler
 */
const handleRequestTabClick = (tab) => {
  if (tab.paneName === 'DATA') {
    requestEditorRef.value.setValue(details.value.requestData)
  }
}

/**
 * el-tab handler
 */
const handleResponseTabClick = (tab) => {
  if (tab.paneName === 'DATA') {
    responseEditorRef.value.setValue(details.value.responseData)
    responseEditorRef.value.formatDocument()
    return
  }
  if (tab.paneName === 'ASSERTION') {
    assertionEditorRef.value.setValue(details.value.failedAssertion)
    return
  }
}

/**
 * 反序列化 Headers
 */
const getHeadersFromJson = (val) => {
  if (!val || (val.charAt(0) !== '{' && val.charAt(val.length - 1) !== '}')) return []
  const data = []
  try {
    const headers = JSON.parse(val)
    Object.keys(headers).forEach((key) => {
      data.push({ name: key, value: headers[key] })
    })
  } catch (error) {
    console.error(error)
  }
  return data
}
</script>

<style lang="scss" scoped>
.details-container {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.el-descriptions {
  :deep(.el-descriptions__label) {
    color: #606266;
    font-weight: bold;
    margin-right: 0;
  }
  :deep(.el-descriptions-item__container) {
    display: inline-flex;
    align-items: center;
  }
}

:deep(.el-descriptions-row) {
  display: flex;
  flex-wrap: wrap;

  .el-descriptions-item {
    margin-right: 20px;
  }

  .el-descriptions-item__label {
    margin-right: 5px;
  }
}

:deep(.el-tabs__header) {
  margin: 0 0 5px;
}

:deep(.el-tabs__active-bar) {
  height: 1px;
}

:deep(.el-tabs__nav-wrap) {
  &:after {
    height: 0;
  }
}

:deep(.el-table td, .el-table th) {
  padding: 0;
}
</style>

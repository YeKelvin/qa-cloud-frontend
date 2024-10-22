<template>
  <div class="sampler-result-container">
    <el-descriptions :column="1">
      <el-descriptions-item label="请求名称：">{{ sampler.samplerName }}</el-descriptions-item>
      <el-descriptions-item v-if="sampler.samplerDesc" label="请求描述：">
        {{ sampler.samplerDesc }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="3">
      <el-descriptions-item label="开始时间：">
        <el-tag type="warning" disable-transitions>{{ sampler.startTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="结束时间：">
        <el-tag type="warning" disable-transitions>{{ sampler.endTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="耗时：">
        <el-tag type="danger" disable-transitions>{{ sampler.elapsedTime }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 请求部分 tabs -->
    <div class="flexbox-between">
      <el-tabs v-model="requestActiveTabName" @tab-click="handleRequestTabClick">
        <el-tab-pane v-if="!isEmpty(requestHeaders)" name="REQUEST_HEADERS">
          <template #label>
            <span>请求头 ({{ requestHeaders.length }})</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="请求数据" name="REQUEST_DATA" />
      </el-tabs>
      <div style="display: flex">
        <el-button
          style="margin-right: 10px; font-size: 16px"
          type="primary"
          link
          :icon="CopyDocument"
          @click="copyRequest"
        />
        <el-radio-group v-show="hasRequestDecoded()" v-model="requestDataType" size="small">
          <el-radio-button value="source">Source</el-radio-button>
          <el-radio-button value="decode">Decode</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 请求头 -->
    <div v-show="showRequestHeaders">
      <el-table :data="requestHeaders" :show-header="false" max-height="300" style="width: 100%">
        <el-table-column prop="name" />
        <el-table-column prop="value" />
      </el-table>
    </div>
    <!-- 请求体 -->
    <div v-show="showRequestData">
      <MonacoEditor ref="requestEditorRef" language="json" style="height: 300px" :readonly="true" />
    </div>

    <!-- 响应部分 -->
    <div class="flexbox-between">
      <el-tabs v-model="responseActiveTabName" @tab-click="handleResponseTabClick">
        <el-tab-pane v-if="!isEmpty(responseHeaders)" label="响应头" name="RESPONSE_HEADERS">
          <template #label>
            <span>响应头 ({{ responseHeaders.length }})</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="响应数据" name="RESPONSE_DATA" />
        <el-tab-pane v-if="sampler.failedAssertion" key="ASSERTION" label="断言" name="ASSERTION" />
      </el-tabs>
      <div style="display: flex">
        <el-button
          style="margin-right: 10px; font-size: 16px"
          type="primary"
          link
          :icon="CopyDocument"
          @click="copyResponse"
        />
        <el-radio-group v-show="hasResponseDecoded()" v-model="responseDataType" size="small">
          <el-radio-button value="source">Source</el-radio-button>
          <el-radio-button value="decode">Decode</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 响应头 -->
    <div v-show="showResponseHeaders">
      <el-table :data="responseHeaders" :show-header="false" max-height="300" style="width: 100%">
        <el-table-column prop="name" />
        <el-table-column prop="value" />
      </el-table>
    </div>
    <!-- 响应体 -->
    <div v-show="showResponseData">
      <MonacoEditor ref="responseEditorRef" language="json" style="height: 300px" :readonly="true" />
    </div>
    <!-- 断言 -->
    <div v-show="showResponseAssertion">
      <MonacoEditor ref="assertionEditorRef" language="log" style="height: 300px" :readonly="true" />
    </div>
  </div>
</template>

<script setup>
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isEmpty } from 'lodash-es'

import * as ReportService from '@/api/script/report'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import useClipboard from '@/composables/useClipboard'

const props = defineProps({
  samplerId: { type: String, default: '' }
})
const { toClipboard } = useClipboard()
const sampler = ref({})
const requestActiveTabName = ref('REQUEST_DATA')
const responseActiveTabName = ref('RESPONSE_DATA')
const showRequestHeaders = computed(() => requestActiveTabName.value === 'REQUEST_HEADERS')
const showRequestData = computed(() => requestActiveTabName.value === 'REQUEST_DATA')
const showResponseHeaders = computed(() => responseActiveTabName.value === 'RESPONSE_HEADERS')
const showResponseData = computed(() => responseActiveTabName.value === 'RESPONSE_DATA')
const showResponseAssertion = computed(() => responseActiveTabName.value === 'ASSERTION')
const requestHeaders = computed(() => {
  if (!sampler.value.requestHeaders) return []
  return getHeadersFromJson(sampler.value.requestHeaders)
})
const responseHeaders = computed(() => {
  if (!sampler.value.responseHeaders) return []
  return getHeadersFromJson(sampler.value.responseHeaders)
})
const requestEditorRef = ref()
const responseEditorRef = ref()
const assertionEditorRef = ref()
const requestDataType = ref('source')
const responseDataType = ref('source')

watch(
  () => props.samplerId,
  val => {
    if (!val) return
    querySamplerResult()
  }
)

watch(requestDataType, val => {
  if (val === 'source') {
    setRequestContent(sampler.value.requestData)
  } else {
    setRequestContent(sampler.value.requestDecoded)
  }
})

watch(responseDataType, val => {
  if (val === 'source') {
    setResponseContent(sampler.value.responseData)
  } else {
    setResponseContent(sampler.value.responseDecoded)
  }
})

onMounted(() => {
  if (!props.samplerId) return
  querySamplerResult()
})

const hasRequestDecoded = () => {
  return !isEmpty(sampler.value.requestDecoded)
}

const hasResponseDecoded = () => {
  return !isEmpty(sampler.value.responseDecoded)
}

const setRequestContent = code => {
  nextTick(() => {
    requestEditorRef.value && requestEditorRef.value.setValue(code)
  })
}

const setResponseContent = code => {
  nextTick(() => {
    if (!responseEditorRef.value) return
    responseEditorRef.value.setValue(code)
    responseEditorRef.value.formatDocument()
  })
}

/**
 * 查询取样器结果
 */
const querySamplerResult = () => {
  ReportService.querySamplerResult({ samplerId: props.samplerId }).then(response => {
    sampler.value = response.data
    handleRequestTabClick({ paneName: requestActiveTabName.value })
    handleResponseTabClick({ paneName: responseActiveTabName.value })
    // 重置源码/解码按钮
    requestDataType.value = isEmpty(sampler.value.requestDecoded) ? 'source' : 'decode'
    responseDataType.value = isEmpty(sampler.value.responseDecoded) ? 'source' : 'decode'
  })
}

/**
 * el-tab handler
 */
const handleRequestTabClick = tab => {
  if (tab.paneName === 'REQUEST_DATA') {
    setRequestContent(sampler.value.requestData)
  }
}

/**
 * el-tab handler
 */
const handleResponseTabClick = tab => {
  if (tab.paneName === 'RESPONSE_DATA') {
    responseEditorRef.value.setValue(sampler.value.responseData)
    responseEditorRef.value.formatDocument()
    return
  }
  if (tab.paneName === 'ASSERTION') {
    assertionEditorRef.value.setValue(sampler.value.failedAssertion)
    return
  }
}

/**
 * 反序列化 Headers
 */
const getHeadersFromJson = val => {
  if (!val || (val.charAt(0) !== '{' && val.at(-1) !== '}')) return []
  const data = []
  try {
    const headers = JSON.parse(val)
    for (const key of Object.keys(headers)) {
      data.push({ name: key, value: headers[key] })
    }
  } catch (error) {
    console.error(error)
  }
  return data
}

const copyRequest = async () => {
  await (requestActiveTabName.value === 'REQUEST_DATA' ? copyRequestData() : copyRequestHeaders())
}

const copyRequestData = async () => {
  const text = requestDataType.value === 'source' ? sampler.value.requestData : sampler.value.requestDecoded
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const copyRequestHeaders = async () => {
  let text = ''
  for (const item of requestHeaders.value) {
    text += `${item.name}: ${item.value}\n`
  }
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const copyResponse = async () => {
  await (responseActiveTabName.value === 'RESPONSE_DATA' ? copyResponseData() : copyResponseHeaders())
}
const copyResponseData = async () => {
  const text = responseDataType.value === 'source' ? sampler.value.responseData : sampler.value.responseDecoded
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const copyResponseHeaders = async () => {
  let text = ''
  for (const item of responseHeaders.value) {
    text += `${item.name}: ${item.value}\n`
  }
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const copyAll = async () => {
  let request = hasRequestDecoded() ? sampler.value.requestDecoded : sampler.value.requestData
  if (request && request.at(-1) !== '\n') {
    request += '\n'
  }
  let response = hasResponseDecoded() ? sampler.value.responseDecoded : sampler.value.responseData
  if (response && response.at(-1) !== '\n') {
    response += '\n'
  }
  const text = `[请求数据]\n${request}\n[响应数据]\n${response}`
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

defineExpose({
  copyAll
})
</script>

<style lang="scss" scoped>
.sampler-result-container {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.el-descriptions {
  :deep(.el-descriptions__label) {
    margin-right: 0;
    font-weight: bold;
    color: #606266;
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

:deep(.el-tabs__item) {
  height: 32px;
  padding: 5px 10px !important;
}

:deep(.el-tabs__header) {
  margin: 0 0 5px;
}

:deep(.el-tabs__active-bar) {
  height: 1px;
}

:deep(.el-tabs__nav-wrap) {
  &::after {
    height: 0;
  }
}

:deep(.el-table td, .el-table th) {
  padding: 0;
}
</style>

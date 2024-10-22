<template>
  <div class="result-collector">
    <!-- 结果列表 -->
    <el-card shadow="hover" class="result-tree">
      <el-empty v-if="isEmpty(workers)" style="width: 100%" />
      <el-scrollbar v-else style="width: 100%" wrap-style="overflow-x: auto" view-style="padding: 10px">
        <el-tree
          default-expand-all
          highlight-current
          style="padding-bottom: 100px"
          :indent="24"
          :data="workers"
          :expand-on-click-node="false"
          :props="{ label: 'name', children: 'children' }"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-item">
              <!-- Worker名称 -->
              <template v-if="node.level == 1">
                <span class="worker-name-wrapper">
                  <span style="display: inline-flex; align-items: center">
                    <SvgIcon icon-name="pymeter-worker" style="font-size: 18px" />
                    <span class="element-name" style="margin-left: 5px">{{ node.label }}</span>
                  </span>
                  <template v-if="props.running && data.running">
                    <SvgIcon icon-name="pymeter-running" style="font-size: 24px" />
                  </template>
                  <template v-else-if="!data.running && data.success">
                    <SvgIcon icon-name="pymeter-successful-sampler" />
                  </template>
                  <template v-else>
                    <SvgIcon icon-name="pymeter-failure-sampler" />
                  </template>
                </span>
              </template>
              <!-- Sampler 名称 -->
              <template v-else>
                <SvgIcon v-if="data.success" icon-name="pymeter-successful-sampler" />
                <SvgIcon v-else-if="!data.success && data.retrying" icon-name="pymeter-warning-sampler" />
                <SvgIcon v-else icon-name="pymeter-failure-sampler" />
                <span class="element-name" style="margin-left: 5px">{{ node.label }}</span>
              </template>
            </span>
          </template>
        </el-tree>
      </el-scrollbar>
    </el-card>

    <!-- 结果数据详情 -->
    <el-card class="result-details" shadow="hover">
      <el-empty v-if="!showing" style="width: 100%; height: 100%; padding-top: 0" />
      <!-- 标签页 -->
      <div v-else class="result-details-header">
        <!-- 标签页头 -->
        <el-tabs v-model="activeTabName" style="width: 100%; padding: 0" @tab-click="handleTabClick">
          <!-- 请求头 tab -->
          <el-tab-pane v-if="requestHeaders.length > 0" name="REQUEST_HEADERS">
            <template #label>
              <span>请求头 ({{ requestHeaders.length }})</span>
              <el-button
                v-show="activeTabName == 'REQUEST_HEADERS'"
                style="font-size: 16px"
                type="primary"
                link
                :icon="CopyDocument"
                @click="copyReqHeaders"
              />
            </template>
          </el-tab-pane>
          <!-- 请求数据 tab -->
          <el-tab-pane name="REQUEST_DATA">
            <template #label>
              <span>请求数据</span>
              <el-button
                v-show="activeTabName == 'REQUEST_DATA'"
                style="font-size: 16px"
                type="primary"
                link
                :icon="CopyDocument"
                @click="copyRequestData"
              />
            </template>
          </el-tab-pane>
          <!-- 响应头 tab -->
          <el-tab-pane v-if="responseHeaders.length > 0" name="RESPONSE_HEADERS">
            <template #label>
              <span>响应头 ({{ responseHeaders.length }})</span>
              <el-button
                v-show="activeTabName == 'RESPONSE_HEADERS'"
                style="font-size: 16px"
                type="primary"
                link
                :icon="CopyDocument"
                @click="copyResHeaders"
              />
            </template>
          </el-tab-pane>
          <!-- 响应数据 tab -->
          <el-tab-pane name="RESPONSE_DATA">
            <template #label>
              <span>响应数据</span>
              <el-button
                v-show="activeTabName == 'RESPONSE_DATA'"
                style="font-size: 16px"
                type="primary"
                link
                :icon="CopyDocument"
                @click="copyResponseData"
              />
            </template>
          </el-tab-pane>
          <!-- 断言结果 tab -->
          <template
            v-if="!isEmpty(current.sampler.failedAssertion) && !isEmpty(current.sampler.failedAssertion.message)"
          >
            <el-tab-pane name="ASSERTION" label="断言结果" />
          </template>
        </el-tabs>
        <!-- 状态、时间等信息 -->
        <span style="display: flex; justify-content: flex-end; width: 100%; padding: 0 10px">
          <!-- 复制按钮 -->
          <el-button style="font-size: 16px" type="primary" link :icon="CopyDocument" @click="copyAll" />
          <!-- 请求状态 -->
          <el-tooltip placement="bottom" effect="light" :show-after="200" :disabled="!current.sampler.responseCode">
            <template #content>
              <div style="font-size: 14px; color: var(--el-text-color-regular)">
                {{ current.sampler.responseCode || '' }}&nbsp;{{ current.sampler.responseMessage || '' }}
              </div>
            </template>
            <el-button link>
              <span>状态:&nbsp;</span>
              <template v-if="current.sampler.success">
                <span style="color: var(--el-color-success)">成功</span>
              </template>
              <template v-else>
                <span style="color: var(--el-color-error)">失败</span>
              </template>
            </el-button>
          </el-tooltip>
          <!-- 耗时 -->
          <el-tooltip placement="bottom" effect="light" :show-after="200">
            <template #content>
              <div style="font-size: 14px; color: var(--el-text-color-regular)">
                <div>开始时间:&nbsp;&nbsp;{{ current.sampler.startTime || '-' }}</div>
                <div>结束时间:&nbsp;&nbsp;{{ current.sampler.endTime || '-' }}</div>
              </div>
            </template>
            <el-button link>
              <span>耗时:&nbsp;</span>
              <template v-if="current.sampler.success">
                <span style="color: var(--el-color-success)">{{ current.sampler.elapsedTime }}ms</span>
              </template>
              <template v-else>
                <span style="color: var(--el-color-error)">{{ current.sampler.elapsedTime }}ms</span>
              </template>
            </el-button>
          </el-tooltip>
        </span>
      </div>

      <!-- 请求头部 -->
      <div v-show="showing && showRequestHeaders" class="tab-pane">
        <el-scrollbar wrap-style="overflow-x:auto;" view-style="padding:10px; height:0;">
          <el-table :data="requestHeaders" :show-header="false" style="width: 100%; padding-bottom: 50px">
            <el-table-column prop="name" width="250" min-width="200" />
            <el-table-column prop="value" />
          </el-table>
        </el-scrollbar>
      </div>

      <!-- 请求体 -->
      <div v-show="showing && showRequestCode" class="tab-pane" style="display: flex; flex-direction: column">
        <span style="display: flex; padding: 5px">
          <el-radio-group v-show="hasRequestDecoded()" v-model="requestDataType" size="small">
            <el-radio-button value="source">Source</el-radio-button>
            <el-radio-button value="decode">Decode</el-radio-button>
          </el-radio-group>
        </span>
        <MonacoEditor ref="requestEditorRef" language="json" height="100" :readonly="true" />
      </div>

      <!-- 响应头部 -->
      <div v-show="showing && showResponseHeaders" class="tab-pane">
        <el-scrollbar wrap-style="overflow-x:auto;" view-style="padding:10px; height:0;">
          <el-table :data="responseHeaders" :show-header="false" style="width: 100%; padding-bottom: 50px">
            <el-table-column prop="name" width="250" min-width="200" />
            <el-table-column prop="value" />
          </el-table>
        </el-scrollbar>
      </div>

      <!-- 响应体 -->
      <div v-show="showing && showResponseCode" class="tab-pane">
        <!-- 按钮组 -->
        <span style="display: flex; align-items: center; padding: 5px">
          <el-radio-group
            v-show="hasResponseDecoded()"
            v-model="responseDataType"
            style="margin-right: 20px"
            size="small"
          >
            <el-radio-button value="source">Source</el-radio-button>
            <el-radio-button value="decode">Decode</el-radio-button>
          </el-radio-group>
          <el-radio-group v-model="responseDisplayType" style="margin-right: 20px" size="small">
            <el-radio-button value="pretty">Pretty</el-radio-button>
            <el-radio-button value="raw">Raw</el-radio-button>
          </el-radio-group>
          <el-select v-model="responseContentType" style="width: 80px; margin-right: 20px" size="small">
            <el-option label="JSON" value="json" />
            <el-option label="XML" value="xml" />
            <el-option label="HTML" value="html" />
            <el-option label="Text" value="text" />
          </el-select>
          <el-button size="small" :type="responseWordWrap == 'on' ? 'primary' : ''" @click="toggleResponseWordWrap">
            <SvgIcon icon-name="pymeter-wordwrap" />
          </el-button>
        </span>
        <MonacoEditor
          ref="responseEditorRef"
          height="100"
          :language="responseDisplayType == 'pretty' ? responseContentType : ''"
          :word-wrap="responseWordWrap"
          :readonly="true"
        />
      </div>

      <!-- 失败断言 -->
      <div v-show="showing && showAssertionCode" class="tab-pane">
        <MonacoEditor ref="assertionEditorRef" language="python" :readonly="true" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isEmpty } from 'lodash-es'

import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import useClipboard from '@/composables/useClipboard'

const { toClipboard } = useClipboard()
const props = defineProps({
  running: { type: Boolean, required: true },
  workers: { type: Array, required: true }
})
const activeTabName = ref('RESPONSE_DATA')
const requestEditorRef = ref()
const responseEditorRef = ref()
const assertionEditorRef = ref()
const current = reactive({ sampler: {} })
const currentRequestData = computed(() => {
  return requestDataType.value === 'source' ? current.sampler.requestData : current.sampler.requestDecoded
})
const currentResponseData = computed(() => {
  return responseDataType.value === 'source' ? current.sampler.responseData : current.sampler.responseDecoded
})
const currentAssertion = computed(() => {
  return current.sampler.failedAssertion?.message
})

const showing = computed(() => !isEmpty(props.workers) && !isEmpty(Object.keys(current.sampler)))
const showRequestCode = computed(() => activeTabName.value === 'REQUEST_DATA')
const showRequestHeaders = computed(() => activeTabName.value === 'REQUEST_HEADERS')
const showResponseCode = computed(() => activeTabName.value === 'RESPONSE_DATA')
const showResponseHeaders = computed(() => activeTabName.value === 'RESPONSE_HEADERS')
const showAssertionCode = computed(() => activeTabName.value === 'ASSERTION')
const requestHeaders = computed(() => {
  if (!current.sampler.requestHeaders) return []

  const data = []
  for (const key of Object.keys(current.sampler.requestHeaders)) {
    data.push({
      name: key,
      value: current.sampler.requestHeaders[key]
    })
  }
  return data
})
const responseHeaders = computed(() => {
  if (!current.sampler.responseHeaders) return []

  const data = []
  for (const key of Object.keys(current.sampler.responseHeaders)) {
    data.push({
      name: key,
      value: current.sampler.responseHeaders[key]
    })
  }
  return data
})
const requestDataType = ref('source')
const responseDataType = ref('source')
const responseDisplayType = ref('pretty')
const responseContentType = ref('json')
const responseWordWrap = ref('on')

watch(requestDataType, val => {
  if (val === 'source') {
    setRequestContent(current.sampler.requestData)
  } else {
    setRequestContent(current.sampler.requestDecoded)
  }
})

watch(responseDataType, val => {
  if (val === 'source') {
    setRequestContent(current.sampler.responseData)
  } else {
    setRequestContent(current.sampler.responseDecoded)
  }
})

const hasRequestDecoded = () => {
  return !isEmpty(current.sampler.requestDecoded)
}

const hasResponseDecoded = () => {
  return !isEmpty(current.sampler.responseDecoded)
}

const handleNodeClick = (data, node) => {
  if (node.level === 1) return

  // 缓存当前取样器数据
  current.sampler = data
  // 重置源码/解码按钮
  requestDataType.value = isEmpty(data.requestDecoded) ? 'source' : 'decode'
  responseDataType.value = isEmpty(data.responseDecoded) ? 'source' : 'decode'

  // 设置显示数据
  if (activeTabName.value === 'REQUEST_DATA') {
    setRequestContent(currentRequestData.value)
    return
  }
  if (activeTabName.value === 'RESPONSE_DATA') {
    setResponseContent(currentResponseData.value)
    return
  }
  if (activeTabName.value === 'ASSERTION') {
    setAssertionContent(currentAssertion.value)
    return
  }
}

const handleTabClick = tab => {
  if (tab.paneName === 'REQUEST_DATA') {
    setRequestContent(currentRequestData.value)
    return
  }
  if (tab.paneName === 'RESPONSE_DATA') {
    setResponseContent(currentResponseData.value)
    return
  }
  if (tab.paneName === 'ASSERTION') {
    setAssertionContent(currentAssertion.value)
    return
  }
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

const setAssertionContent = code => {
  nextTick(() => {
    if (isEmpty(code)) return
    assertionEditorRef.value && assertionEditorRef.value.setValue(code)
  })
}

const toggleResponseWordWrap = () => {
  responseWordWrap.value = responseWordWrap.value === 'on' ? 'off' : 'on'
}

const copyRequestData = async () => {
  const text = requestDataType.value === 'source' ? current.sampler.requestData : current.sampler.requestDecoded
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const copyReqHeaders = async () => {
  let text = ''
  const headers = current.sampler.requestHeaders
  const keys = Object.keys(headers)
  for (const key of keys) {
    text += `${key}: ${headers[key]}\n`
  }
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const copyResponseData = async () => {
  const text = responseDataType.value === 'source' ? current.sampler.responseData : current.sampler.responseDecoded
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const copyResHeaders = async () => {
  let text = ''
  const headers = current.sampler.responseHeaders
  const keys = Object.keys(headers)
  for (const key of keys) {
    text += `${key}: ${headers[key]}\n`
  }
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const copyAll = async () => {
  let request = hasRequestDecoded() ? current.sampler.requestDecoded : current.sampler.requestData
  if (request && request.at(-1) !== '\n') {
    request += '\n'
  }
  let response = hasResponseDecoded() ? current.sampler.responseDecoded : current.sampler.responseData
  if (response && response.at(-1) !== '\n') {
    response += '\n'
  }
  const text = `[请求数据]\n${request}\n[响应数据]\n${response}`
  await toClipboard(text)
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const clear = () => {
  current.sampler = {}
}

defineExpose({
  clear
})
</script>

<style lang="scss" scoped>
.result-collector {
  display: flex;
  flex: 1;
  width: 100%;
  height: calc(100% - 2px);
  padding: 10px;
  padding-top: 0;
}

.result-tree {
  display: flex;
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  height: 100%;
  overflow: hidden;

  :deep(.el-card__body) {
    display: flex;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    padding: 0;
  }
}

.tree-item {
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.worker-name-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 10px;
}

.element-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  user-select: none;
}

.result-details {
  width: 100%;
  margin-left: 10px;

  :deep(.el-card__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    padding: 0;

    .tab-pane {
      width: 100%;
      height: 100%;
    }
  }
}

.result-details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 5px;
}

.el-tabs__item > span + .el-button {
  margin-left: 5px;
}

:deep(.el-tabs__header) {
  margin: 0 0 5px;
}

:deep(.el-tabs__active-bar) {
  height: 1px;
}

:deep(.el-tabs__nav-wrap) {
  &::after {
    height: 0 !important;
  }
}

:deep(.el-tabs__item) {
  height: 32px;
  padding: 5px 10px !important;
  font-size: 16px;

  &:nth-child(3) {
    margin-right: 15px;
  }
}

:deep(.el-table) {
  border-top: var(--el-table-border);
}

:deep(.el-table td, .el-table th) {
  padding: 1px;
}

:deep(.el-tree-node__content) {
  height: 100%;
  min-height: 26px;
}

:deep(.el-empty__description) {
  display: none;
}

:deep(.el-button.is-link:focus, .el-button.is-link:hover) {
  color: inherit;
}
</style>

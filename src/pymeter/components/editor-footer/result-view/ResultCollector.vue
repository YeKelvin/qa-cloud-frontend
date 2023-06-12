<template>
  <div class="result-collector">
    <!-- 结果列表 -->
    <el-card shadow="hover" class="result-tree">
      <el-empty v-if="isEmpty(workers)" style="width: 100%" />
      <el-scrollbar v-else style="width: 100%; height: 100%" wrap-style="overflow-x: auto" view-style="padding: 10px">
        <el-tree
          default-expand-all
          highlight-current
          style="padding-bottom: 50px"
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
                    <SvgIcon icon-name="pymeter-worker" style="width: 1.2em; height: 1.2em" />
                    <span class="element-name" style="margin-left: 5px">{{ node.label }}</span>
                  </span>
                  <SvgIcon v-if="data.running" icon-name="pymeter-running" style="width: 1.5em; height: 1.5em" />
                  <SvgIcon v-else-if="!data.running && data.success" icon-name="pymeter-successful-sampler" />
                  <SvgIcon v-else icon-name="pymeter-failure-sampler" />
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
      <el-empty v-if="!showing" style="width: 100%" />
      <!-- 标签页 -->
      <div v-else class="result-details-header">
        <!-- 标签页头 -->
        <el-tabs v-model="activeTabName" style="width: 100%; padding: 0" @tab-click="handleTabClick">
          <el-tab-pane name="REQUEST" label="请求数据" />
          <template v-if="requestHeaders.length > 0">
            <el-tab-pane name="REQUEST_HEADERS" :label="`请求头 (${requestHeaders.length})`" />
          </template>
          <el-tab-pane name="RESPONSE" label="响应数据" />
          <template v-if="responseHeaders.length > 0">
            <el-tab-pane name="RESPONSE_HEADERS" :label="`响应头 (${responseHeaders.length})`" />
          </template>
          <template
            v-if="!isEmpty(current.sampler.failedAssertion) && !isEmpty(current.sampler.failedAssertion.message)"
          >
            <el-tab-pane name="ASSERTION" label="断言结果" />
          </template>
        </el-tabs>
        <!-- 状态、时间等信息 -->
        <span style="display: flex; padding: 0 10px">
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
              <span style="color: var(--el-color-success)">{{ current.sampler.elapsedTime }}ms</span>
            </el-button>
          </el-tooltip>
        </span>
      </div>

      <!-- 请求体 -->
      <div v-show="showing && showRequestCode" class="tab-pane">
        <MonacoEditor ref="requestEditorRef" language="json" height="100" :read-only="true" />
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

      <!-- 响应体 -->
      <div v-show="showing && showResponseCode" class="tab-pane">
        <!-- 按钮组 -->
        <span style="display: flex; align-items: center; padding: 5px">
          <el-radio-group v-model="responseDisplayType" style="margin-right: 20px" size="small">
            <el-radio-button label="pretty">Pretty</el-radio-button>
            <el-radio-button label="raw">Raw</el-radio-button>
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
          :read-only="true"
        />
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

      <!-- 失败断言 -->
      <div v-show="showing && showAssertionCode" class="tab-pane">
        <MonacoEditor ref="assertionEditorRef" language="python" :read-only="true" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps({
  workers: { type: Array, default: () => [] }
})

const activeTabName = ref('RESPONSE')
const current = reactive({ sampler: {} })
const requestEditorRef = ref()
const responseEditorRef = ref()
const assertionEditorRef = ref()

const showing = computed(() => !isEmpty(props.workers) && !isEmpty(Object.keys(current.sampler)))
const showRequestCode = computed(() => activeTabName.value === 'REQUEST')
const showRequestHeaders = computed(() => activeTabName.value === 'REQUEST_HEADERS')
const showResponseCode = computed(() => activeTabName.value === 'RESPONSE')
const showResponseHeaders = computed(() => activeTabName.value === 'RESPONSE_HEADERS')
const showAssertionCode = computed(() => activeTabName.value === 'ASSERTION')
const requestHeaders = computed(() => {
  if (!current.sampler.requestHeaders) return []

  const data = []
  Object.keys(current.sampler.requestHeaders).forEach((key) => {
    data.push({
      name: key,
      value: current.sampler.requestHeaders[key]
    })
  })
  return data
})
const responseHeaders = computed(() => {
  if (!current.sampler.responseHeaders) return []

  const data = []
  Object.keys(current.sampler.responseHeaders).forEach((key) => {
    data.push({
      name: key,
      value: current.sampler.responseHeaders[key]
    })
  })
  return data
})
const responseDisplayType = ref('pretty')
const responseContentType = ref('json')
const responseWordWrap = ref('on')

const handleNodeClick = (data, node) => {
  if (node.level === 1) return
  current.sampler = data

  if (activeTabName.value === 'REQUEST') {
    setRequestCode(data.request)
    return
  }
  if (activeTabName.value === 'RESPONSE') {
    setResponseCode(data.response)
    return
  }
  if (activeTabName.value === 'ASSERTION') {
    setFailedAssertionCode(data.failedAssertion?.message)
    return
  }
}
const handleTabClick = (tab) => {
  if (tab.paneName === 'REQUEST') {
    setRequestCode(current.sampler.request)
    return
  }
  if (tab.paneName === 'RESPONSE') {
    setResponseCode(current.sampler.response)
    return
  }
  if (tab.paneName === 'ASSERTION') {
    setFailedAssertionCode(current.sampler.failedAssertion?.message)
    return
  }
}
const setRequestCode = (code) => {
  nextTick(() => {
    requestEditorRef.value && requestEditorRef.value.setValue(code)
  })
}
const setResponseCode = (code) => {
  nextTick(() => {
    if (!responseEditorRef.value) return
    responseEditorRef.value.setValue(code)
    responseEditorRef.value.formatDocument()
  })
}
const setFailedAssertionCode = (code) => {
  nextTick(() => {
    if (isEmpty(code)) return
    assertionEditorRef.value && assertionEditorRef.value.setValue(code)
  })
}

const toggleResponseWordWrap = () => {
  responseWordWrap.value = responseWordWrap.value === 'on' ? 'off' : 'on'
}
</script>

<style lang="scss" scoped>
.result-collector {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 10px;
  padding-top: 0;
}

.result-tree {
  min-width: 400px;
  max-width: 400px;
  width: 400px;
  height: 100%;
  overflow: hidden;

  :deep(.el-card__body) {
    padding: 0;
    width: 100%;
    height: 100%;
    align-items: flex-start;
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
  user-select: none;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-details {
  margin-left: 10px;
  width: 100%;

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
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

:deep(.el-tabs__header) {
  margin: 0 0 5px;
}

:deep(.el-tabs__active-bar) {
  height: 1px;
}

:deep(.el-tabs__nav-wrap) {
  &:after {
    height: 0 !important;
  }
}

:deep(.el-tabs__item) {
  height: 100%;
  padding: 5px !important;
  padding-right: 10px !important;
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

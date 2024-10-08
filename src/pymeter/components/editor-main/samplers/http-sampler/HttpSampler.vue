<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form ref="elformRef" label-width="80px" :model="elementData" :rules="elementRules">
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <FxInput v-model="elementData.elementName" placeholder="元素名称" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementDesc">
        <FxInput v-model="elementData.elementDesc" placeholder="元素备注" />
      </el-form-item>

      <!-- URL = 请求方法 + 请求方法-->
      <el-form-item id="url" label="地址：" prop="elementProps.HTTPSampler__url">
        <span style="display: flex; flex: 1">
          <!-- 请求方法 -->
          <FxInput
            v-model="elementData.elementProps.HTTPSampler__url"
            placeholder="请求地址"
            style="margin-right: 10px"
          >
            <template #prepend>
              <!-- 请求方法 -->
              <HTTPMethodSelect v-model="elementData.elementProps.HTTPSampler__method" />
            </template>
          </FxInput>
          <!-- 运行按钮 -->
          <el-dropdown split-button type="primary" trigger="click" placement="bottom-end" @click="sendRequest()">
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
            <span>运 行</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="runAll()">
                  <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
                  <span>完整运行</span>
                </el-dropdown-item>
                <el-dropdown-item @click="runTestCase()">
                  <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
                  <span>用例运行</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
      </el-form-item>

      <!-- 请求配置tab -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="HTTP_HEADERS">
          <template #label>
            <el-badge :hidden="hiddenHTTPHeadersDot" type="success" is-dot>请求头</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="HTTP_QUERYS">
          <template #label>
            <el-badge :hidden="hiddenHTTPQuerysDot" type="success" is-dot>查询参数</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="HTTP_BODY">
          <template #label>
            <el-badge :hidden="hiddenHTTPBodyDot" type="success" is-dot>请求体</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="PREV_PROCESSOR">
          <template #label>
            <el-badge :hidden="isEmpty(elementData.elementCompos.prevList)" type="success" is-dot>前置处理器</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="POST_PROCESSOR">
          <template #label>
            <el-badge :hidden="isEmpty(elementData.elementCompos.postList)" type="success" is-dot>后置处理器</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="TEST_ASSERTION">
          <template #label>
            <el-badge :hidden="isEmpty(elementData.elementCompos.testList)" type="success" is-dot>测试断言器</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="HTTP_CONFIGS">
          <template #label>
            <el-badge :hidden="hiddenHTTPConfigsDot" type="success" is-dot>HTTP配置</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="COMPO_SETTINGS">
          <template #label>
            <el-badge :hidden="hiddenCompoSettingsDot" type="success" is-dot>组件设置</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 请求头 -->
      <div v-if="showHTTPHeadersTab" class="tab-pane">
        <!-- 请求头模板 -->
        <HTTPHeaderTemplate v-model="headerTemplateRefs" />
        <!-- 请求头表格 -->
        <HTTPHeaderTable v-model="headerData" />
      </div>

      <!-- 请求参数 -->
      <div v-if="showHTTPQuerysTab" class="tab-pane">
        <HTTPQueryTable v-model="queryData" />
      </div>

      <!-- 请求主体 -->
      <div v-if="showHTTPBodyTab" class="tab-pane">
        <!-- 主体数据类型单选框 -->
        <span class="body-mode-options-wrapper" style="padding: 0 10px">
          <el-radio-group v-model="bodyMode">
            <el-radio value="none">none</el-radio>
            <el-radio value="form-data">form-data</el-radio>
            <el-radio value="x-www-form-urlencoded">form-urlencoded</el-radio>
            <el-radio value="raw">raw</el-radio>
            <el-radio value="custom">custom</el-radio>
          </el-radio-group>
          <!-- raw data type -->
          <el-select v-if="bodyMode == 'raw'" v-model="bodyRawType" class="raw-type">
            <el-option key="json" label="JSON" value="json" />
            <el-option key="xml" label="XML" value="xml" />
            <el-option key="text" label="TEXT" value="text" />
          </el-select>
        </span>

        <!-- 表单 -->
        <template v-if="bodyMode == 'form-data'">
          <HTTPFileTable v-model="fileData" />
        </template>

        <!-- 表单 -->
        <template v-if="bodyMode == 'x-www-form-urlencoded'">
          <HTTPFormTable v-model="formData" />
        </template>

        <!-- 代码编辑器 -->
        <template v-if="bodyMode == 'raw' || bodyMode == 'custom'">
          <FxEditor ref="bodyEditorRef" v-model="bodyData" language="json" style="margin-bottom: 10px" />
        </template>
      </div>

      <!-- 前置处理器 -->
      <div v-if="showPrevProcessorTab" class="tab-pane">
        <PrevProcessorPane v-model="elementData.elementCompos.prevList" owner-type="ALL" />
      </div>

      <!-- 后置处理器 -->
      <div v-if="showPostProcessorTab" class="tab-pane">
        <PostProcessorPane v-model="elementData.elementCompos.postList" owner-type="ALL" />
      </div>

      <!-- 测试断言器 -->
      <div v-if="showTestAssertionTab" class="tab-pane">
        <TestAssertionPane v-model="elementData.elementCompos.testList" owner-type="ALL" />
      </div>

      <!-- HTTP配置 -->
      <div v-if="showHTTPConfigsTab" class="tab-pane">
        <el-form label-width="100px">
          <!-- 重定向 -->
          <el-form-item label="重定向：">
            <el-switch
              v-model="elementData.elementProps.HTTPSampler__follow_redirects"
              active-value="true"
              inactive-value="false"
              inline-prompt
              :active-icon="Check"
              :inactive-icon="Close"
            />
          </el-form-item>

          <!-- 编码 -->
          <el-form-item label="编码：">
            <FxInput
              v-model="elementData.elementProps.HTTPSampler__encoding"
              style="width: 300px"
              placeholder="UTF-8"
            />
          </el-form-item>

          <!-- 连接超时时间 -->
          <el-form-item label="连接超时：">
            <FxInput
              v-model="elementData.elementProps.HTTPSampler__connect_timeout"
              style="width: 300px"
              placeholder="超时时长"
            >
              <template #append>毫秒</template>
            </FxInput>
          </el-form-item>

          <!-- 响应超时时间 -->
          <el-form-item label="响应超时：">
            <FxInput
              v-model="elementData.elementProps.HTTPSampler__response_timeout"
              style="width: 300px"
              placeholder="超时时长"
            >
              <template #append>毫秒</template>
            </FxInput>
          </el-form-item>
        </el-form>
      </div>

      <!-- 组件设置 -->
      <div v-if="showCompoSettingsTab" class="tab-pane">
        <el-form label-width="120px">
          <!-- 筛选规则 -->
          <el-form-item>
            <!-- label -->
            <template #label>
              <div style="display: flex">
                <span>筛选规则：</span>
                <!-- tips -->
                <el-tooltip placement="right" effect="light">
                  <template #content>
                    <div style="font-size: 16px; line-height: 2; color: var(--el-text-color-regular)">
                      <!-- eslint-disable-next-line prettier/prettier -->
                      <div>
                        <b>- 说明:</b>
                        仅执行符合条件的组件
                      </div>
                    </div>
                  </template>
                  <el-button :icon="Warning" style="font-size: 16px" link />
                </el-tooltip>
              </div>
            </template>
            <ComponentFilter
              v-model="elementData.elementProps.HTTPSampler__running_strategy.filter"
              :condition-data="filterConditionData"
            />
          </el-form-item>
          <!-- 倒序执行 -->
          <el-form-item>
            <!-- label -->
            <template #label>
              <div style="display: flex">
                <span>倒序执行：</span>
                <!-- tips -->
                <el-tooltip placement="right" effect="light">
                  <template #content>
                    <div style="font-size: 16px; line-height: 2; color: var(--el-text-color-regular)">
                      <!-- eslint-disable-next-line prettier/prettier -->
                      <div>
                        <b>- 说明:</b>
                        指定组件的运行顺序，默认顺序执行
                      </div>
                      <!-- eslint-disable-next-line prettier/prettier -->
                      <div>
                        <b>- 顺序:</b>
                        空间 → 集合 → 线程 → 控制器 → 取样器
                      </div>
                      <!-- eslint-disable-next-line prettier/prettier -->
                      <div>
                        <b>- 倒序:</b>
                        取样器 → 控制器 → 线程 → 集合 → 空间
                      </div>
                    </div>
                  </template>
                  <el-button :icon="Warning" style="font-size: 16px" link />
                </el-tooltip>
              </div>
            </template>
            <el-select
              v-model="elementData.elementProps.HTTPSampler__running_strategy.reverse"
              style="width: 300px"
              multiple
              clearable
            >
              <el-option label="前置" value="PREV" />
              <el-option label="后置" value="POST" />
              <el-option label="断言" value="ASSERT" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-form>

    <!-- 操作按钮 -->
    <template v-if="creation || unsaved">
      <SaveButton :tips="shortcutKeyName" @click="save()" />
    </template>
  </div>
</template>

<script setup>
import { Check, Close, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from 'lodash-es'

import HTTPFileTable from './HttpSamplerFileTable.vue'
import HTTPFormTable from './HttpSamplerFormTable.vue'
import HTTPHeaderTable from './HttpSamplerHeaderTable.vue'
import HTTPHeaderTemplate from './HttpSamplerHeaderTemplate.vue'
import HTTPMethodSelect from './HttpSamplerMethodSelect.vue'
import HTTPQueryTable from './HttpSamplerQueryTable.vue'
import useHTTP from './useHTTP'

import * as ElementService from '@/api/script/element'
import PostProcessorPane from '@/pymeter/components/editor-main/components/PostProcessorPane.vue'
import PrevProcessorPane from '@/pymeter/components/editor-main/components/PrevProcessorPane.vue'
import TestAssertionPane from '@/pymeter/components/editor-main/components/TestAssertionPane.vue'
import ComponentFilter from '@/pymeter/components/editor-main/others/ComponentFilter.vue'
import FxEditor from '@/pymeter/components/editor-main/others/FunctionEditor.vue'
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'
import SaveButton from '@/pymeter/components/editor-main/others/SaveButton.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { usePyMeterDB } from '@/store/pymeter-db'
import { toHashCode } from '@/utils/object-util'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const { runSampler, runOffline, runWorkerBySampler } = useRunnableElement()
const { assignElement, assignMetadata, assignComponent } = useElement()
const { unsaved, metadata, creation, localkey, shortcutKeyName, updateTabName, expandParentNode, refreshElementTree } =
  useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: 'HTTP请求',
  elementDesc: '',
  elementType: 'SAMPLER',
  elementClass: 'HTTPSampler',
  elementAttrs: {
    HTTPSampler__header_templates: [],
    HTTPSampler__headers: [],
    HTTPSampler__querys: [],
    HTTPSampler__forms: [],
    HTTPSampler__files: []
  },
  elementProps: {
    HTTPSampler__url: '',
    HTTPSampler__method: 'GET',
    HTTPSampler__data: '',
    HTTPSampler__encoding: '',
    HTTPSampler__follow_redirects: 'false',
    HTTPSampler__connect_timeout: '',
    HTTPSampler__response_timeout: '',
    HTTPSampler__running_strategy: {
      filter: {},
      reverse: []
    }
  },
  elementCompos: {
    confList: [],
    prevList: [],
    postList: [],
    testList: []
  }
})
const elementRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'elementProps.HTTPSampler__url': [{ required: true, message: '请求地址不能为空', trigger: 'blur' }],
  'elementProps.HTTPSampler__method': [{ required: true, message: '请求方法不能为空', trigger: 'blur' }]
}
const headerTemplateRefs = computed({
  get: () => elementData.value.elementAttrs.HTTPSampler__header_templates,
  set: val => (elementData.value.elementAttrs.HTTPSampler__header_templates = val)
})
const headerData = computed({
  get: () => elementData.value.elementAttrs.HTTPSampler__headers,
  set: val => (elementData.value.elementAttrs.HTTPSampler__headers = val)
})
const queryData = computed({
  get: () => elementData.value.elementAttrs.HTTPSampler__querys,
  set: val => (elementData.value.elementAttrs.HTTPSampler__querys = val)
})
const formData = computed({
  get: () => elementData.value.elementAttrs.HTTPSampler__forms,
  set: val => (elementData.value.elementAttrs.HTTPSampler__forms = val)
})
const fileData = computed({
  get: () => elementData.value.elementAttrs.HTTPSampler__files,
  set: val => (elementData.value.elementAttrs.HTTPSampler__files = val)
})
const bodyData = computed({
  get: () => elementData.value.elementProps.HTTPSampler__data,
  set: val => (elementData.value.elementProps.HTTPSampler__data = val)
})
const {
  bodyMode,
  bodyRawType,
  filterConditionData,
  hiddenHTTPBodyDot,
  hiddenHTTPQuerysDot,
  hiddenHTTPHeadersDot,
  hiddenHTTPConfigsDot,
  hiddenCompoSettingsDot,
  setBodyMode,
  checkRunningStrategy
} = useHTTP(elementData)
const elformRef = ref()
const bodyEditorRef = ref()
const activeTabName = ref('HTTP_QUERYS')
const showHTTPBodyTab = computed(() => activeTabName.value === 'HTTP_BODY')
const showHTTPQuerysTab = computed(() => activeTabName.value === 'HTTP_QUERYS')
const showHTTPConfigsTab = computed(() => activeTabName.value === 'HTTP_CONFIGS')
const showHTTPHeadersTab = computed(() => activeTabName.value === 'HTTP_HEADERS')
const showPrevProcessorTab = computed(() => activeTabName.value === 'PREV_PROCESSOR')
const showPostProcessorTab = computed(() => activeTabName.value === 'POST_PROCESSOR')
const showTestAssertionTab = computed(() => activeTabName.value === 'TEST_ASSERTION')
const showCompoSettingsTab = computed(() => activeTabName.value === 'COMPO_SETTINGS')

watch(
  elementData,
  debounce(localdata => {
    // 添加组件索引
    for (const [index, item] of localdata.elementCompos.prevList.entries()) item.elementIndex = index + 1
    for (const [index, item] of localdata.elementCompos.postList.entries()) item.elementIndex = index + 1
    for (const [index, item] of localdata.elementCompos.testList.entries()) item.elementIndex = index + 1
    // 如果前后端数据一致则代表数据未更改
    if (metadata.value.hashcode === toHashCode(localdata)) {
      // 数据一致则表示数据未变更
      unsaved.value = false
      // 数据未变更，移除离线数据
      offlineDB.removeItem(localkey.value)
      return
    }
    // 标记数据未保存
    unsaved.value = true
    // 存储离线数据
    offlineDB.setItem(localkey.value, JSON.parse(JSON.stringify({ data: localdata, meta: metadata.value })))
  }, 250),
  { deep: true, flush: 'sync' }
)

onMounted(async () => {
  // 优先查询离线数据
  if (unsaved.value) {
    queryOfflineData()
    return
  }
  // 新增模式计算HashCode并存储
  if (creation.value) {
    elementData.value.elementAttrs.HTTPSampler__headers.push({ enabled: true, name: '', desc: '', value: '' })
    elementData.value.elementAttrs.HTTPSampler__querys.push({ enabled: true, name: '', desc: '', value: '' })
    elementData.value.elementAttrs.HTTPSampler__forms.push({
      enabled: true,
      type: 'string',
      name: '',
      desc: '',
      value: ''
    })
    elementData.value.elementAttrs.HTTPSampler__files.push({
      enabled: true,
      name: '',
      desc: '',
      value: '',
      argtype: 'text',
      mimetype: ''
    })
    metadata.value.hashcode = toHashCode(elementData.value)
    return
  }
  // 最后才查询后端数据
  queryBackendData()
})

/**
 * 查询离线数据
 */
const queryOfflineData = async () => {
  const offline = await offlineDB.getItem(localkey.value)
  assignElement(elementData.value, offline.data)
  setBodyData()
  assignMetadata(metadata.value, offline.meta)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  let response = null
  // 查询元素信息
  response = await ElementService.queryElementInfo({ elementNo: elementData.value.elementNo })
  const backendData = response.data
  backendData.elementAttrs.HTTPSampler__headers.push({ enabled: true, name: '', value: '', desc: '' })
  backendData.elementAttrs.HTTPSampler__querys.push({ enabled: true, name: '', value: '', desc: '' })
  backendData.elementAttrs.HTTPSampler__forms.push({ enabled: true, type: 'string', name: '', value: '', desc: '' })
  backendData.elementAttrs.HTTPSampler__files.push({
    enabled: true,
    argtype: 'text',
    name: '',
    value: '',
    mimetype: '',
    desc: ''
  })
  assignElement(elementData.value, backendData)
  // 初始化主体数据
  setBodyData()
  // 查询元素组件
  response = await ElementService.queryElementComponents({ elementNo: elementData.value.elementNo })
  assignComponent(elementData.value, response.data)
  // 计算HashCode并存储
  assignMetadata(metadata.value, { hashcode: toHashCode(elementData.value) })
}

/**
 * 设置 body 相关
 */
const setBodyData = () => {
  // 设置主体模式
  setBodyMode()
  // 激活Tab
  activeTabName.value = bodyMode.value === 'none' ? 'HTTP_QUERYS' : 'HTTP_BODY'
  // 初始化主体数据
  if (!['form-data', 'x-www-form-urlencoded'].includes(bodyMode.value)) {
    nextTick(
      () => bodyEditorRef.value && bodyEditorRef.value.setValue(elementData.value.elementProps.HTTPSampler__data)
    )
  }
}

const isBlankAll = (...args) => {
  for (const arg of args) {
    if (!isEmpty(arg)) return false
  }
  return true
}

/**
 * 移除请求头、查询参数和表单中的空行数据
 */
const removeBlankData = () => {
  if (!isEmpty(headerData.value)) {
    headerData.value = headerData.value.filter(row => !isBlankAll(row.name, row.value, row.desc))
  }
  if (!isEmpty(queryData.value)) {
    queryData.value = queryData.value.filter(row => !isBlankAll(row.name, row.value, row.desc))
  }
  if (!isEmpty(formData.value)) {
    formData.value = formData.value.filter(row => !isBlankAll(row.name, row.value, row.desc))
  }
  if (!isEmpty(fileData.value)) {
    fileData.value = fileData.value.filter(row => !isBlankAll(row.name, row.value, row.desc))
  }
}

/**
 * 清理无效数据
 */
const cleanInvalidData = () => {
  if (['raw', 'custom'].includes(bodyMode.value)) {
    formData.value = []
    fileData.value = []
    return
  }
  if (bodyMode.value === 'none') {
    bodyData.value = ''
    formData.value = []
    fileData.value = []
    return
  }
  if (bodyMode.value === 'form-data') {
    bodyData.value = ''
    formData.value = []
    return
  }
  if (bodyMode.value === 'x-www-form-urlencoded') {
    bodyData.value = ''
    fileData.value = []
    return
  }
}

/**
 * 运行元素
 */
const sendRequest = () => {
  if (isEmpty(elementData.value.elementProps.HTTPSampler__url)) {
    ElMessage({ message: '运行无效，请求地址为空', type: 'error', duration: 2 * 1000 })
    return
  }
  if (creation.value) {
    runOffline(metadata.value.rootNo, metadata.value.parentNo, props.editorNo, { aloneness: true })
  } else {
    runSampler(metadata.value.rootNo, elementData.value.elementNo)
  }
}

/**
 * 完整运行
 */
const runAll = () => {
  if (creation.value) {
    runOffline(metadata.value.rootNo, metadata.value.parentNo, props.editorNo, { aloneness: false })
  } else {
    runSampler(metadata.value.rootNo, elementData.value.elementNo, { aloneness: false })
  }
}

/**
 * 用例运行
 */
const runTestCase = () => {
  if (creation.value) {
    runOffline(metadata.value.rootNo, metadata.value.parentNo, props.editorNo)
  } else {
    runWorkerBySampler(metadata.value.rootNo, elementData.value.elementNo)
  }
}

/**
 * 修改元素
 */
const modifyElement = async () => {
  // 修改元素
  await ElementService.modifyElement(elementData.value)
}

/**
 * 创建元素
 */
const createElement = async () => {
  // 新增元素
  const response = await ElementService.createElementChild({
    rootNo: props.metadata.rootNo,
    parentNo: props.metadata.parentNo,
    ...elementData.value
  })
  // 提取元素编号
  const elementNo = response.data.elementNo
  // 移除离线数据
  offlineDB.removeItem(props.editorNo)
  // 更新Tab序列号
  metadata.value.sn = elementNo
  // 更新元素编号
  elementData.value.elementNo = elementNo
  // 展开父节点
  expandParentNode()
}

/**
 * 提交数据
 */
const save = async () => {
  let error = false
  // 表单校验
  error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 运行策略校验
  error = checkRunningStrategy()
  if (error) {
    ElMessage({ message: '运行策略校验失败，关键字不能为空', type: 'error', duration: 2 * 1000 })
    return
  }
  // 移除请求头、查询参数和表单中的空行数据
  removeBlankData()
  // 清理无效数据
  cleanInvalidData()
  // 保存元素
  creation.value ? await createElement() : await modifyElement()
  // 标记数据已保存
  unsaved.value = false
  // 更新HashCode
  metadata.value.hashcode = toHashCode(elementData.value)
  // 移除离线数据
  offlineDB.removeItem(localkey.value)
  // 重新查询侧边栏的元素列表
  refreshElementTree()
  // 更新 tab 标题
  updateTabName(elementData.value.elementName)
  // 成功提示
  ElMessage({ message: '保存成功', type: 'info', duration: 2 * 1000 })
}

defineExpose({
  save
})
</script>

<style lang="scss" scoped>
.tab-pane {
  min-height: 150px;
}

.body-mode-options-wrapper {
  display: inline-flex;
  align-items: center;
  height: 30px;
  margin-bottom: 5px;
  line-height: 30px;
}

.raw-type {
  width: 80px;
  margin-left: 40px;

  &.el-select {
    --el-select-disabled-border: none;
    --el-select-border-color-hover: none;
    --el-select-input-focus-border-color: none;

    :deep(.el-select__wrapper) {
      box-shadow: none;
    }
  }

  :deep(.el-select__selected-item) {
    color: #409eff;
    background-color: #fff;
    box-shadow: none;
  }

  :deep(.el-select__caret) {
    color: #409eff;
  }
}

:deep(.el-input-group__prepend) {
  background-color: var(--el-fill-color-blank);
}

:deep(.el-badge__content) {
  top: 8px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}

:deep(.el-button-group) {
  display: flex;
}
</style>
./useHTTP

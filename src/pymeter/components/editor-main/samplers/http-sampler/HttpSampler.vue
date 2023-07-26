<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elementFormRef"
      label-position="right"
      label-width="80px"
      inline-message
      :model="elementInfo"
      :rules="elementFormRules"
    >
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <el-input v-model="elementInfo.elementName" placeholder="元素名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementRemark">
        <el-input v-model="elementInfo.elementRemark" placeholder="元素备注" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- URL = 请求方法 + 请求方法-->
      <el-form-item id="url" label="地址：" prop="property.HTTPSampler__url">
        <span style="display: flex; flex: 1">
          <!-- 请求方法 -->
          <el-input
            v-model="elementInfo.property.HTTPSampler__url"
            placeholder="请求地址"
            clearable
            :readonly="queryMode"
          >
            <template #prepend>
              <!-- 请求方法 -->
              <HTTPMethodSelect v-model="elementInfo.property.HTTPSampler__method" :disabled="queryMode" />
            </template>
          </el-input>
          <!-- 运行按钮 -->
          <el-button v-show="queryMode" type="danger" style="margin-left: 10px" @click="executeSampler(elementNo)">
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
            运 行
          </el-button>
        </span>
      </el-form-item>

      <!-- 请求配置tab -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="HEADERS">
          <template #label>
            <el-badge :hidden="hiddenHeadersDot" type="success" is-dot>请求头</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="PARAMS">
          <template #label>
            <el-badge :hidden="hiddenQuerysDot" type="success" is-dot>查询参数</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="BODY">
          <template #label>
            <el-badge :hidden="hiddenBodyDot" type="success" is-dot>请求体</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="PREV_PROCESSOR">
          <template #label>
            <el-badge :hidden="isEmpty(prevProcessorComponentList)" type="success" is-dot>前置处理器</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="POST_PROCESSOR">
          <template #label>
            <el-badge :hidden="isEmpty(postProcessorComponentList)" type="success" is-dot>后置处理器</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="TEST_ASSERTION">
          <template #label>
            <el-badge :hidden="isEmpty(testAssertionComponentList)" type="success" is-dot>测试断言器</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="HTTP_CONFIG">
          <template #label>
            <el-badge :hidden="hiddenConfigDot" type="success" is-dot>HTTP配置</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="SETTINGS">
          <template #label>
            <el-badge :hidden="hiddenSettingsDot" type="success" is-dot>组件设置</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 请求头 -->
      <div v-if="showHeadersTab" class="tab-pane">
        <!-- 请求头模板 -->
        <HTTPHeaderTemplate v-model="selectedHeaderTemplates" :edit-mode="editMode" />
        <!-- 请求头表格 -->
        <HTTPHeaderTable v-model:data="headerItems" :edit-mode="editMode" />
      </div>

      <!-- 请求参数 -->
      <div v-if="showParameterTab" class="tab-pane">
        <HTTPQueryTable v-model:data="queryItems" :edit-mode="editMode" />
      </div>

      <!-- 请求主体 -->
      <div v-show="showBodyTab" class="tab-pane">
        <!-- 主体数据类型单选框 -->
        <span class="body-mode-options-wrapper">
          <el-radio-group v-model="bodyMode" :disabled="queryMode">
            <el-radio label="none">none</el-radio>
            <el-radio label="form-data">form-data</el-radio>
            <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
            <el-radio label="raw">raw</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
          <!-- raw data type -->
          <el-select v-if="bodyMode == 'raw'" v-model="bodyRawType" class="raw-type" :disabled="queryMode">
            <el-option key="json" label="JSON" value="json" />
            <el-option key="xml" label="XML" value="xml" />
            <el-option key="text" label="TEXT" value="text" />
          </el-select>
        </span>

        <!-- 表单 -->
        <HTTPFileTable v-if="bodyMode == 'form-data'" v-model:data="fileItems" />

        <!-- 表单 -->
        <HTTPFormTable v-if="bodyMode == 'x-www-form-urlencoded'" v-model:data="formItems" :edit-mode="editMode" />

        <!-- 代码编辑器 -->
        <MonacoEditor
          v-if="bodyMode == 'raw' || bodyMode == 'custom'"
          ref="bodyCodeEditorRef"
          v-model="bodyCode"
          language="json"
          style="margin-bottom: 10px"
          :readonly="queryMode"
        />
      </div>

      <!-- 前置处理器 -->
      <div v-if="showPrevProcessorTab" class="tab-pane">
        <PrevProcessorPane v-model="prevProcessorComponentList" :edit-mode="editMode" owner-type="ALL" />
      </div>

      <!-- 后置处理器 -->
      <div v-if="showPostProcessorTab" class="tab-pane">
        <PostProcessorPane v-model="postProcessorComponentList" :edit-mode="editMode" owner-type="ALL" />
      </div>

      <!-- 测试断言器 -->
      <div v-if="showTestAssertionTab" class="tab-pane">
        <AssertionPane v-model="testAssertionComponentList" :edit-mode="editMode" owner-type="ALL" />
      </div>

      <!-- HTTP配置 -->
      <div v-if="showConfigTab" class="tab-pane">
        <el-form label-position="right" label-width="100px">
          <!-- 重定向 -->
          <el-form-item label="重定向：">
            <el-switch
              v-model="elementInfo.property.HTTPSampler__follow_redirects"
              active-value="true"
              inactive-value="false"
              inline-prompt
              :active-icon="Check"
              :inactive-icon="Close"
              :disabled="queryMode"
            />
          </el-form-item>

          <!-- 编码 -->
          <el-form-item label="编码：">
            <el-input
              v-model="elementInfo.property.HTTPSampler__encoding"
              style="width: 300px"
              placeholder="UTF-8"
              clearable
              :readonly="queryMode"
            />
          </el-form-item>

          <!-- 连接超时时间 -->
          <el-form-item label="连接超时：">
            <el-input
              v-model="elementInfo.property.HTTPSampler__connect_timeout"
              style="width: 300px"
              placeholder="超时时长"
              clearable
              :readonly="queryMode"
            >
              <template #append>毫秒</template>
            </el-input>
          </el-form-item>

          <!-- 响应超时时间 -->
          <el-form-item label="响应超时：">
            <el-input
              v-model="elementInfo.property.HTTPSampler__response_timeout"
              style="width: 300px"
              placeholder="超时时长"
              clearable
              :readonly="queryMode"
            >
              <template #append>毫秒</template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 组件设置 -->
      <div v-if="showSettingsTab" class="tab-pane">
        <el-form label-position="right" label-width="120px">
          <!-- 筛选规则 -->
          <el-form-item>
            <!-- label -->
            <template #label>
              <div style="display: flex">
                <span>筛选规则：</span>
                <!-- tips -->
                <el-tooltip placement="right" effect="light">
                  <template #content>
                    <div style="font-size: 14px; color: var(--el-text-color-regular)">
                      <div>- 根据指定的规则筛选组件</div>
                      <div>- 包含: 前置处理器、后置处理器、断言器</div>
                      <div>- 目的: 通过筛选以达到仅执行或排除指定的组件</div>
                    </div>
                  </template>
                  <el-button :icon="Warning" style="font-size: 16px" link />
                </el-tooltip>
              </div>
            </template>
            <ComponentFilter v-model="runningStrategy.filter" :condition-data="conditionData" />
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
                    <div style="font-size: 14px; color: var(--el-text-color-regular)">
                      <div>- 说明: 根据组件的类型指定其运行顺序</div>
                      <div>- 包含: 前置处理器、后置处理器、断言器</div>
                      <div>- 正序: 空间 → 集合 → 线程 → 控制器 → 取样器</div>
                      <div>- 倒序: 取样器 → 控制器 → 线程 → 集合 → 空间</div>
                    </div>
                  </template>
                  <el-button :icon="Warning" style="font-size: 16px" link />
                </el-tooltip>
              </div>
            </template>
            <el-select v-model="runningStrategy.reverse" style="width: 300px" multiple clearable :disabled="queryMode">
              <el-option label="前置" value="PREV" />
              <el-option label="后置" value="POST" />
              <el-option label="断言" value="ASSERT" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <el-affix target=".pymeter-component-container" position="bottom" :offset="60">
        <el-form-item v-if="queryMode">
          <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
          <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        </el-form-item>
        <el-form-item v-else-if="modifyMode">
          <el-button :icon="Check" type="danger" @click="modifyElement()">保 存</el-button>
          <el-button :icon="Check" @click="modifyElement(true)">保存并关闭</el-button>
          <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        </el-form-item>
        <el-form-item v-else-if="createMode">
          <el-button :icon="Check" type="primary" @click="createElement()">保 存</el-button>
          <el-button :icon="Check" @click="createElement(true)">保存并关闭</el-button>
          <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        </el-form-item>
      </el-affix>
    </el-form>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import ComponentFilter from '@/pymeter/components/editor-main/common/ComponentFilter.vue'
import AssertionPane from '@/pymeter/components/editor-main/panes/AssertionPane.vue'
import PostProcessorPane from '@/pymeter/components/editor-main/panes/PostProcessorPane.vue'
import PrevProcessorPane from '@/pymeter/components/editor-main/panes/PrevProcessorPane.vue'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { isBlankAll } from '@/utils/string-util'
import { Check, Close, Edit, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { assign, isEmpty } from 'lodash-es'
import HTTPFileTable from './HttpSamplerFileTable.vue'
import HTTPFormTable from './HttpSamplerFormTable.vue'
import HTTPHeaderTable from './HttpSamplerHeaderTable.vue'
import HTTPHeaderTemplate from './HttpSamplerHeaderTemplate.vue'
import HTTPMethodSelect from './HttpSamplerMethodSelect.vue'
import HTTPQueryTable from './HttpSamplerQueryTable.vue'
import useHTTPBody from './useHTTPBody'
import useHTTPHeader from './useHTTPHeader'
import useHTTPQuery from './useHTTPQuery'

const props = defineProps(EditorProps)
const { executeSampler } = useRunnableElement()
const {
  editMode,
  queryMode,
  modifyMode,
  createMode,
  functions,
  editNow,
  setReadonly,
  updateTab,
  closeTab,
  expandParentNode,
  refreshElementTree
} = useEditor(props)
provide('queryMode', queryMode)
const elementFormRef = ref()
const elementFormRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.HTTPSampler__url': [{ required: true, message: '请求地址不能为空', trigger: 'blur' }],
  'property.HTTPSampler__method': [{ required: true, message: '请求方法不能为空', trigger: 'blur' }]
}
const elementInfo = ref({
  elementNo: props.editorNo,
  elementName: 'HTTP请求',
  elementRemark: '',
  elementType: 'SAMPLER',
  elementClass: 'HTTPSampler',
  property: {
    HTTPSampler__url: '',
    HTTPSampler__method: 'GET',
    HTTPSampler__headers: '',
    HTTPSampler__params: '',
    HTTPSampler__data: '',
    HTTPSampler__encoding: '',
    HTTPSampler__follow_redirects: 'false',
    HTTPSampler__connect_timeout: '',
    HTTPSampler__response_timeout: ''
  }
})
const elementNo = computed(() => elementInfo.value.elementNo)
const elementName = computed(() => elementInfo.value.elementName)

// 运行策略的逻辑条件数据
const conditionData = [
  {
    field: { label: '类型', value: 'TYPE' },
    options: [
      { label: '前置', value: 'PREV' },
      { label: '后置', value: 'POST' },
      { label: '断言', value: 'ASSERT' }
    ]
  },
  {
    field: { label: '层级', value: 'LEVEL' },
    options: [
      { label: '空间', value: '0' },
      { label: '集合', value: '1' },
      { label: '线程', value: '2' },
      { label: '控制器', value: '3' },
      { label: '取样器', value: '4' }
    ]
  }
]
// 运行策略
const runningStrategy = ref({
  filter: {},
  reverse: []
})

// header相关属性
const selectedHeaderTemplates = ref([])
const { headerItems, headerData, setContentType, getContentType, removeContentType } = useHTTPHeader()

// query相关属性
const { queryItems, queryData } = useHTTPQuery()

// body相关属性
const bodyCodeEditorRef = ref()
const { bodyCode, bodyMode, bodyRawType, bodyRawTypeEnum, bodyData, formItems, fileItems, setBodyMode } = useHTTPBody()

// 内置元素相关属性
const componentList = ref([])
const prevProcessorComponentList = ref([])
const postProcessorComponentList = ref([])
const testAssertionComponentList = ref([])
const pendingSubmitComponentList = computed(() => {
  // 添加 sortNumber 属性
  prevProcessorComponentList.value.forEach((item, index) => (item.sortNumber = index + 1))
  postProcessorComponentList.value.forEach((item, index) => (item.sortNumber = index + 1))
  testAssertionComponentList.value.forEach((item, index) => (item.sortNumber = index + 1))
  // 组合成一个数组
  return [...prevProcessorComponentList.value, ...postProcessorComponentList.value, ...testAssertionComponentList.value]
})

const activeTabName = ref('PARAMS')
const showHeadersTab = computed(() => activeTabName.value === 'HEADERS')
const showParameterTab = computed(() => activeTabName.value === 'PARAMS')
const showBodyTab = computed(() => activeTabName.value === 'BODY')
const showPrevProcessorTab = computed(() => activeTabName.value === 'PREV_PROCESSOR')
const showPostProcessorTab = computed(() => activeTabName.value === 'POST_PROCESSOR')
const showTestAssertionTab = computed(() => activeTabName.value === 'TEST_ASSERTION')
const showConfigTab = computed(() => activeTabName.value === 'HTTP_CONFIG')
const showSettingsTab = computed(() => activeTabName.value === 'SETTINGS')

const hiddenHeadersDot = computed(() => {
  const headers = headerItems.value
  if (headers.length == 0) {
    return isEmpty(selectedHeaderTemplates.value)
  }
  if (headers.length == 1) {
    const item = headers[0]
    if (isEmpty(item.name) && isEmpty(item.value)) return isEmpty(selectedHeaderTemplates.value)
  }
  return false
})
const hiddenQuerysDot = computed(() => {
  const querys = queryItems.value
  if (querys.length == 0) {
    return true
  }
  if (querys.length == 1) {
    const item = querys[0]
    if (isEmpty(item.name) && isEmpty(item.value) && isEmpty(item.desc)) return true
  }
  return false
})
const hiddenBodyDot = computed(() => {
  const mode = bodyMode.value
  if (mode === 'raw' || mode === 'custom') {
    if (bodyCode.value === '') return true
  }
  if (mode === 'form-data') {
    const files = fileItems.value
    if (files.length == 0) {
      return true
    }
    if (files.length == 1) {
      const item = files[0]
      if (isEmpty(item.name) && isEmpty(item.value) && isEmpty(item.desc)) return true
    }
  }
  if (mode === 'x-www-form-urlencoded') {
    const forms = formItems.value
    if (forms.length == 0) {
      return true
    }
    if (forms.length == 1) {
      const item = forms[0]
      if (isEmpty(item.name) && isEmpty(item.value) && isEmpty(item.desc)) return true
    }
  }
  return false
})
const hiddenConfigDot = computed(() => {
  const elProps = elementInfo.value.property
  return (
    elProps.HTTPSampler__encoding === '' &&
    elProps.HTTPSampler__connect_timeout === '' &&
    elProps.HTTPSampler__response_timeout === '' &&
    elProps.HTTPSampler__follow_redirects === 'false'
  )
})
const hiddenSettingsDot = computed(() => {
  return isEmpty(runningStrategy.value.filter) && isEmpty(runningStrategy.value.reverse)
})

watch(bodyMode, () => {
  if (queryMode.value) {
    return
  }
  if (bodyMode.value === 'none' || bodyMode.value === 'custom') {
    removeContentType()
    return
  }
  if (bodyMode.value === 'form-data') {
    setContentType('multipart/form-data')
    return
  }
  if (bodyMode.value === 'x-www-form-urlencoded') {
    setContentType('application/x-www-form-urlencoded')
    return
  }
  if (bodyMode.value === 'raw') {
    setContentType(bodyRawTypeEnum[bodyRawType.value])
    return
  }
})
watch(bodyRawType, () => {
  if (queryMode.value) return
  setContentType(bodyRawTypeEnum[bodyRawType.value])
})

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  // 查询元素信息、内置元素和请求头模板
  query()
})

const query = (_elementNo_ = elementNo.value, focus = true) => {
  // 查询元素信息
  ElementService.queryElementInfo({ elementNo: _elementNo_ }).then((response) => {
    elementInfo.value = response.result
    setHeaderItems()
    setQueryItems()
    setAboutBody()
    setRunningStrategy()
    focus && focusActiveTab()
  })
  // 查询并初始化内置元素
  ElementService.queryElementComponents({ elementNo: _elementNo_ }).then((response) => {
    componentList.value = response.result
    setComponentsByType()
    sortComponents()
  })
  // 查询元素关联的请求头模板列表
  ElementService.queryHttpheaderTemplateRefs({ elementNo: _elementNo_ }).then((response) => {
    selectedHeaderTemplates.value = response.result
  })
}

/**
 * 根据类型分别存储内置元素
 */
const setComponentsByType = () => {
  // 先清空原有列表
  prevProcessorComponentList.value = []
  postProcessorComponentList.value = []
  testAssertionComponentList.value = []
  // 根据类型存储至列表
  componentList.value.forEach((component) => {
    if (component.elementType === 'PREV_PROCESSOR') {
      prevProcessorComponentList.value.push(component)
    } else if (component.elementType === 'POST_PROCESSOR') {
      postProcessorComponentList.value.push(component)
    } else if (component.elementType === 'ASSERTION') {
      testAssertionComponentList.value.push(component)
    } else {
      return
    }
  })
}

/**
 * 根据 sortNumber 排序
 */
const sortComponents = () => {
  prevProcessorComponentList.value.sort((a, b) => a.sortNumber - b.sortNumber)
  postProcessorComponentList.value.sort((a, b) => a.sortNumber - b.sortNumber)
  testAssertionComponentList.value.sort((a, b) => a.sortNumber - b.sortNumber)
}

/**
 * 初始化 headers
 */
const setHeaderItems = () => {
  const headers = elementInfo.value.property.HTTPSampler__headers
  if (!isEmpty(headerItems.value)) {
    headerItems.value = [] // 表格不为空时，清空数组
  }
  if (!headers) return
  headers.property.HeaderManager__headers.forEach((item) => {
    headerItems.value.push({
      enabled: item.enabled,
      name: item.property.Header__name,
      value: item.property.Header__value
    })
  })
}

/**
 * 初始化 params
 */
const setQueryItems = () => {
  const querys = elementInfo.value.property.HTTPSampler__params
  if (!isEmpty(queryItems.value)) {
    queryItems.value = [] // 表格不为空时，清空数组
  }
  if (!querys) return
  querys.property.Arguments__arguments.forEach((item) => {
    queryItems.value.push({
      enabled: item.enabled,
      name: item.property.Argument__name,
      value: item.property.Argument__value,
      desc: item.property.Argument__desc
    })
  })
}

/**
 * 初始化 forms
 */
const setFormItems = () => {
  const forms = elementInfo.value.property.HTTPSampler__data
  if (!isEmpty(formItems.value)) {
    formItems.value = [] // 表格不为空时，清空数组
  }
  if (!forms) return
  forms.property.Arguments__arguments.forEach((item) => {
    formItems.value.push({
      enabled: item.enabled,
      name: item.property.Argument__name,
      value: item.property.Argument__value,
      desc: item.property.Argument__desc
    })
  })
}

/**
 * 初始化 files
 */
const setFileItems = () => {
  const files = elementInfo.value.property.HTTPSampler__data
  if (!isEmpty(fileItems.value)) {
    fileItems.value = [] // 表格不为空时，清空数组
  }
  if (!files) return
  files.property.Arguments__arguments.forEach((item) => {
    fileItems.value.push({
      enabled: item.enabled,
      name: item.property.Argument__name,
      value: item.property.Argument__value,
      argtype: item.property.Argument__argtype,
      mimetype: item.property.Argument__mimetype,
      desc: item.property.Argument__desc
    })
  })
}

/**
 * 设置 body 相关
 */
const setAboutBody = () => {
  setBodyMode(getContentType())
  // 初始化 BodyData
  if (bodyMode.value === 'form-data') {
    setFileItems()
  } else if (bodyMode.value === 'x-www-form-urlencoded') {
    setFormItems()
  } else {
    nextTick(() => setBodyData())
  }
}

/**
 * 设置body编辑器的内容
 */
const setBodyData = () => {
  bodyCodeEditorRef.value && bodyCodeEditorRef.value.setValue(elementInfo.value.property.HTTPSampler__data)
}

/**
 * 设置运行策略
 */
const setRunningStrategy = () => {
  const strategyProp = elementInfo.value.property.HTTPSampler__running_strategy
  if (isEmpty(strategyProp)) return
  runningStrategy.value.filter = strategyProp.filter || {}
  runningStrategy.value.reverse = strategyProp.reverse || []
}

/**
 * 根据 http 参数激活对应的 tab
 */
const focusActiveTab = () => {
  if (!isEmpty(queryItems.value)) {
    activeTabName.value = 'PARAMS'
  } else {
    activeTabName.value = 'BODY'
  }
}

/**
 * 更新元素属性
 */
const updateElementProperty = () => {
  const elProps = elementInfo.value.property
  // 合并请求头、query参数和body参数
  assign(elProps, {
    HTTPSampler__headers: headerData.value,
    HTTPSampler__params: queryData.value,
    HTTPSampler__data: bodyData.value
  })
  // 设置运行策略
  if (
    isEmpty(runningStrategy.value.filter) &&
    isEmpty(runningStrategy.value.reverse) &&
    'HTTPSampler__running_strategy' in elProps
  ) {
    elProps.HTTPSampler__running_strategy = null
  } else {
    elProps.HTTPSampler__running_strategy = runningStrategy.value
  }
}

/**
 * 校验逻辑条件
 */
const checkRunningStrategyFilter = () => {
  let error = false
  // 过滤空白的逻辑条件
  const filterRule = runningStrategy.value.filter
  if (isEmpty(filterRule)) return
  if ('logic' in filterRule) {
    error = checkLogicalCondition(filterRule)
  } else {
    if ('field' in filterRule && isEmpty(filterRule.field)) {
      error = true
    }
  }
  if (error) {
    ElMessage({ message: '条件关键字不能为空', type: 'error', duration: 2 * 1000 })
  }
  return error
}

/**
 * 校验条件的关键字是否为空
 */
const checkLogicalCondition = (grouprule) => {
  const rules = grouprule.rules
  for (let i = 0; i < rules.length; i++) {
    if ('logic' in rules[i]) {
      if (checkLogicalCondition(rules[i])) return true
    } else {
      if (isEmpty(rules[i].field)) return true
    }
  }
}

/**
 * 移除表格中的空行
 */
const removeAllBlankRow = () => {
  if (!isEmpty(headerItems.value)) {
    headerItems.value = headerItems.value.filter((row) => !isBlankAll(row.name, row.value))
  }
  if (!isEmpty(queryItems.value)) {
    queryItems.value = queryItems.value.filter((row) => !isBlankAll(row.name, row.value, row.desc))
  }
  if (!isEmpty(formItems.value)) {
    formItems.value = formItems.value.filter((row) => !isBlankAll(row.name, row.value, row.desc))
  }
}

const checkForm = async () => {
  // 表单校验
  const error = await elementFormRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
  }

  return error
}

/**
 * 修改元素
 */
const modifyElement = async (close = false) => {
  // 表单校验
  let error = false
  error = await checkForm()
  if (error) return
  error = checkRunningStrategyFilter()
  if (error) return
  // 更新元素属性
  updateElementProperty()
  // 更新元素
  await ElementService.modifyHttpSampler({
    ...elementInfo.value,
    componentList: pendingSubmitComponentList.value,
    headerTemplates: selectedHeaderTemplates.value
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 移除所有表格里的空行
    removeAllBlankRow()
    // 更新 tab 标题
    updateTab(elementName.value)
    // 重新查询元素信息，内置元素和请求头模板
    query(undefined, false)
  }
  // 重新查询侧边栏的元素列表
  refreshElementTree()
  // 成功提示
  ElMessage({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
  // 需要关闭 tab
  if (close) {
    closeTab()
  }
}

/**
 * 创建元素
 */
const createElement = async (close = false) => {
  // 表单校验
  const error = await checkForm()
  if (error) return
  // 更新元素属性
  updateElementProperty()
  // 新增元素
  const response = await ElementService.createHttpSampler({
    rootNo: props.metadata.rootNo,
    parentNo: props.metadata.parentNo,
    child: {
      ...elementInfo.value,
      componentList: pendingSubmitComponentList.value,
      headerTemplates: selectedHeaderTemplates.value
    }
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 移除所有表格里的空行
    removeAllBlankRow()
    // 更新 tab 标题和编号
    updateTab(elementName.value, response.result.elementNo)
    // 重新查询元素信息，内置元素和请求头模板
    query(response.result.elementNo, false)
  }
  // 展开父节点
  expandParentNode()
  // 重新查询侧边栏的元素列表
  refreshElementTree()
  // 成功提示
  ElMessage({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
  // 需要关闭 tab
  if (close) {
    closeTab()
  }
}

// 暂存函数，给 useEditor 使用
functions.createFn = createElement
functions.modifyFn = modifyElement
</script>

<style lang="scss" scoped>
.tab-pane {
  min-height: 150px;
}

.body-mode-options-wrapper {
  display: inline-flex;
  align-items: center;
  height: 30px;
  line-height: 30px;
  margin-bottom: 5px;
}

.raw-type {
  margin-left: 40px;
  width: 90px;

  &.el-select {
    --el-select-disabled-border: none;
    --el-select-border-color-hover: none;
    --el-select-input-focus-border-color: none;
  }

  :deep(.el-input__inner) {
    background-color: #ffffff;
    box-shadow: none;
    color: #409eff;
  }

  :deep(.el-input__wrapper) {
    background-color: #ffffff;
    box-shadow: none;
  }

  :deep(.el-select__caret) {
    color: #409eff;
  }
}

:deep(.el-badge__content) {
  top: 10px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

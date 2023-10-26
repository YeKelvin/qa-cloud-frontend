<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elementFormRef"
      label-position="right"
      label-width="120px"
      inline-message
      :model="elementInfo"
      :rules="elementFormRules"
    >
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <el-input v-model="elementInfo.elementName" placeholder="元素名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementDesc">
        <el-input v-model="elementInfo.elementDesc" placeholder="元素备注" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 串行执行 -->
      <el-form-item label="串行执行：" prop="property.TestCollection__serialize_workers">
        <el-switch
          v-model="elementInfo.property.TestCollection__serialize_workers"
          active-value="true"
          inactive-value="false"
          inline-prompt
          :active-icon="Check"
          :inactive-icon="Close"
          :disabled="true"
        />
      </el-form-item>

      <!-- 间隔时间 -->
      <!-- <el-form-item label="间隔时间：" prop="property.TestCollection__delay">
        <el-input
          v-model="elementInfo.property.TestCollection__delay"
          placeholder="间隔运行时间"
          clearable
          :readonly="true"
        >
          <template #append>ms</template>
        </el-input>
      </el-form-item> -->

      <!-- 配置tab -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="SETTINGS">
          <template #label>
            <el-badge :hidden="hiddenSettingsDot" type="success" is-dot>组件设置</el-badge>
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
      </el-tabs>

      <!-- 组件设置 -->
      <div v-if="showSettingsTab" class="tab-pane">
        <el-form label-position="right" label-width="140px">
          <!-- 是否排除空间组件 -->
          <el-form-item>
            <!-- label -->
            <template #label>
              <div style="display: flex">
                <span>排除空间组件：</span>
                <!-- tips -->
                <el-tooltip placement="right" effect="light">
                  <template #content>
                    <div style="font-size: 14px; color: var(--el-text-color-regular)">
                      <div>- 解析脚本时不加载空间组件</div>
                      <div>- 空间组件包括: 配置器、前置处理器、后置处理器、测试断言器</div>
                    </div>
                  </template>
                  <el-button :icon="Warning" style="font-size: 16px" link />
                </el-tooltip>
              </div>
            </template>
            <el-switch
              v-model="elementInfo.elementAttrs.TestCollection__exclude_workspaces"
              inline-prompt
              :active-icon="Check"
              :inactive-icon="Close"
              :active-value="true"
              :inactive-value="false"
              :disabled="queryMode"
            />
          </el-form-item>
          <!-- 倒序执行 -->
          <el-form-item>
            <!-- label -->
            <template #label>
              <div style="display: flex">
                <span>倒序执行组件：</span>
                <!-- tips -->
                <el-tooltip placement="right" effect="light">
                  <template #content>
                    <div style="font-size: 14px; color: var(--el-text-color-regular)">
                      <div>- 说明: 根据组件类型指定取样器组件的运行顺序</div>
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

      <!-- 前置处理器 -->
      <div v-if="showPrevProcessorTab" class="tab-pane">
        <PrevProcessorPane v-model="prevProcessorComponentList" :edit-mode="editMode" owner-type="HTTP" />
      </div>

      <!-- 后置处理器 -->
      <div v-if="showPostProcessorTab" class="tab-pane">
        <PostProcessorPane v-model="postProcessorComponentList" :edit-mode="editMode" owner-type="HTTP" />
      </div>

      <!-- 测试断言器 -->
      <div v-if="showTestAssertionTab" class="tab-pane">
        <AssertionPane v-model="testAssertionComponentList" :edit-mode="editMode" owner-type="HTTP" />
      </div>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        <el-dropdown
          split-button
          trigger="click"
          type="danger"
          placement="bottom"
          style="margin-left: 10px"
          @click="executeTestCollection(elementNo)"
        >
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
          <span>运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="queryCollectionJson()">查询脚本(JSON)</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
    </el-form>

    <el-dialog v-model="showJsonScriptDialog" center title="Json脚本" width="80%">
      <MonacoEditor ref="jsonEditorRef" language="json" style="height: 400px" :readonly="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import AssertionPane from '@/pymeter/components/editor-main/panes/AssertionPane.vue'
import PostProcessorPane from '@/pymeter/components/editor-main/panes/PostProcessorPane.vue'
import PrevProcessorPane from '@/pymeter/components/editor-main/panes/PrevProcessorPane.vue'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'
import { Check, Close, Edit, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isEmpty } from 'lodash-es'

const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()
const { assignElement } = useElement()
const { executeTestCollection } = useRunnableElement()
const { editMode, queryMode, modifyMode, createMode, functions, editNow, setReadonly, updateTab, closeTab } =
  useEditor(props)

const elementFormRef = ref()
const elementFormRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
}
const elementInfo = ref({
  elementNo: props.editorNo,
  elementName: '测试集合',
  elementDesc: '',
  elementType: 'COLLECTION',
  elementClass: 'TestCollection',
  elementAttrs: {
    TestCollection__exclude_workspaces: false
  },
  property: {
    TestCollection__serialize_workers: 'true',
    TestCollection__delay: '0'
  }
})
const elementNo = computed(() => elementInfo.value.elementNo)
const elementName = computed(() => elementInfo.value.elementName)
// 运行策略
const runningStrategy = ref({
  reverse: []
})
const activeTabName = ref('SETTINGS')
const showSettingsTab = computed(() => activeTabName.value === 'SETTINGS')
const showPrevProcessorTab = computed(() => activeTabName.value === 'PREV_PROCESSOR')
const showPostProcessorTab = computed(() => activeTabName.value === 'POST_PROCESSOR')
const showTestAssertionTab = computed(() => activeTabName.value === 'TEST_ASSERTION')
const hiddenSettingsDot = computed(() => {
  return !elementInfo.value.elementAttrs.TestCollection__exclude_workspaces && isEmpty(runningStrategy.value.reverse)
})

const componentList = ref([])
const prevProcessorComponentList = ref([])
const postProcessorComponentList = ref([])
const testAssertionComponentList = ref([])
const pendingSubmitComponentList = computed(() => {
  // 添加 elementIndex 属性
  prevProcessorComponentList.value.forEach((item, index) => (item.elementIndex = index + 1))
  postProcessorComponentList.value.forEach((item, index) => (item.elementIndex = index + 1))
  testAssertionComponentList.value.forEach((item, index) => (item.elementIndex = index + 1))
  // 组合成一个数组
  return [...prevProcessorComponentList.value, ...postProcessorComponentList.value, ...testAssertionComponentList.value]
})

const jsonEditorRef = ref()
const showJsonScriptDialog = ref(false)

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  query()
})

/**
 * 查询元素信息及内置元素
 */
const query = (_elementNo_ = elementNo.value) => {
  // 查询元素信息
  ElementService.queryElementInfo({ elementNo: _elementNo_ }).then((response) => {
    assignElement(elementInfo.value, response.result)
    setRunningStrategy()
  })
  // 查询内置元素
  ElementService.queryElementComponents({ elementNo: _elementNo_ }).then((response) => {
    componentList.value = response.result
    setComponentsByType()
    sortComponents()
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
  componentList.value.forEach((item) => {
    if (item.elementType === 'PREV_PROCESSOR') {
      prevProcessorComponentList.value.push(item)
    } else if (item.elementType === 'POST_PROCESSOR') {
      postProcessorComponentList.value.push(item)
    } else if (item.elementType === 'ASSERTION') {
      testAssertionComponentList.value.push(item)
    } else {
      return
    }
  })
}

/**
 * 设置运行策略
 */
const setRunningStrategy = () => {
  const strategyProp = elementInfo.value.property.TestCollection__running_strategy
  if (isEmpty(strategyProp)) return
  runningStrategy.value.reverse = strategyProp.reverse || []
}

/**
 * 根据 elementIndex 排序
 */
const sortComponents = () => {
  prevProcessorComponentList.value.sort((a, b) => a.elementIndex - b.elementIndex)
  postProcessorComponentList.value.sort((a, b) => a.elementIndex - b.elementIndex)
  testAssertionComponentList.value.sort((a, b) => a.elementIndex - b.elementIndex)
}

/**
 * 更新元素属性
 */
const updateElementProperty = () => {
  const elProps = elementInfo.value.property
  // 设置运行策略
  if (isEmpty(runningStrategy.value.reverse) && 'TestCollection__running_strategy' in elProps) {
    elProps.TestCollection__running_strategy = null
  } else {
    elProps.TestCollection__running_strategy = runningStrategy.value
  }
}

/**
 * 修改元素
 */
const modifyElement = async (close = false) => {
  // 表单校验
  const error = await elementFormRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 更新元素属性
  updateElementProperty()
  // 修改元素
  await ElementService.modifyElement({
    ...elementInfo.value,
    componentList: pendingSubmitComponentList.value
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题
    updateTab(elementName.value)
    // 重新查询元素信息及内置元素
    query()
  }
  // 重新查询集合列表
  pymeterStore.refreshCollections()
  // 成功提示
  ElMessage({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
  // 关闭 tab
  if (close) {
    closeTab()
  }
}

/**
 * 创建元素
 */
const createElement = async (close = false) => {
  // 工作空间非空校验
  if (isEmpty(workspaceStore.workspaceNo)) {
    ElMessage({ message: '请先选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  // 表单校验
  const error = await elementFormRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 更新元素属性
  updateElementProperty()
  // 新增元素
  const response = await ElementService.createElementRoot({
    workspaceNo: workspaceStore.workspaceNo,
    ...elementInfo.value,
    componentList: pendingSubmitComponentList.value
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题和编号
    updateTab(elementName.value, response.result.elementNo)
    // 重新查询元素信息及内置元素
    query(response.result.elementNo)
  }
  // 重新查询集合列表
  pymeterStore.refreshCollections()
  // 新增成功后立即在列表中展示
  pymeterStore.addSelectedCollection(response.result.elementNo)
  // 滚动至底部
  pymeterStore.scrollToElementTreeBottom()
  // 成功提示
  ElMessage({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
  // 关闭 tab
  if (close) {
    closeTab()
  }
}

/**
 * 查看 Json 脚本
 */
const queryCollectionJson = () => {
  ExecutionService.queryCollectionJson({
    collectionNo: elementNo.value,
    datasets: pymeterStore.selectedDatasets,
    useCurrentValue: pymeterStore.useCurrentValue
  }).then((response) => {
    showJsonScriptDialog.value = true
    nextTick(() => {
      jsonEditorRef.value.setValue(JSON.stringify(response.result))
      setTimeout(() => {
        jsonEditorRef.value.formatDocument()
      }, 200)
    })
  })
}

// 暂存函数，给 useEditor 使用
functions.createFn = createElement
functions.modifyFn = modifyElement
</script>

<style lang="scss" scoped>
.tab-pane {
  min-height: 150px;
}

:deep(.el-badge__content) {
  top: 10px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

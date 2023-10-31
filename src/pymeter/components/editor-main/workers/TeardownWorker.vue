<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="140px"
      inline-message
      :model="elementData"
      :rules="elementFormRules"
    >
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <el-input v-model="elementData.elementName" placeholder="元素名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementDesc">
        <el-input v-model="elementData.elementDesc" placeholder="元素备注" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 元素属性 -->
      <el-form-item label="失败处理：" prop="property.TeardownWorker__on_sample_error">
        <el-select
          v-model="elementData.property.TeardownWorker__on_sample_error"
          :disabled="queryMode"
          style="width: 100%"
        >
          <el-option label="继续" value="continue" />
          <el-option label="开始下一个主控制器的循环" value="start_next_thread" />
          <el-option label="开始下一个当前控制器的循环" value="start_next_current_loop" />
          <el-option label="中断当前控制器的循环" value="break_current_loop" />
          <el-option label="停止主控制器" value="stop_worker" />
          <el-option label="停止测试" value="stop_test" />
          <el-option label="立即停止测试" value="stop_now" />
        </el-select>
      </el-form-item>

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="HTTP">
          <template #label>
            <el-badge :hidden="hiddenConfigDot" type="success" is-dot>HTTP配置</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- HTTP 设置 -->
      <div v-if="showHTTPSettings">
        <!-- 是否使用 HTTP 会话 -->
        <el-form-item label="使用会话：">
          <el-switch
            v-model="elementData.elementAttrs.Worker__use_http_session"
            inline-prompt
            :active-icon="Check"
            :inactive-icon="Close"
            :disabled="queryMode"
          />
        </el-form-item>
        <!-- 是否在每次迭代开始前重新打开一个新的 HTTP 会话 -->
        <el-form-item label="迭代时刷新会话：">
          <el-switch
            v-model="elementData.elementAttrs.Worker__clear_http_session_each_iteration"
            inline-prompt
            :active-icon="Check"
            :inactive-icon="Close"
            :disabled="queryMode"
          />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        <el-dropdown
          split-button
          trigger="click"
          type="danger"
          style="margin-left: 10px"
          placement="bottom"
          @click="executeTestWorker(elementNo)"
        >
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
          <span>运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="queryWorkerJson()">查询脚本(JSON)</el-dropdown-item>
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
      <MonacoEditor ref="jsonEditor" language="json" style="height: 400px" :readonly="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { usePyMeterStore } from '@/store/pymeter'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import EditorProps from '@/pymeter/composables/editor.props'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const pymeterStore = usePyMeterStore()
const props = defineProps(EditorProps)
const { assignElement } = useElement()
const { executeTestWorker } = useRunnableElement()
const {
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
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementData = ref({
  elementNo: '',
  elementName: '后置用例',
  elementDesc: '',
  elementType: 'WORKER',
  elementClass: 'TeardownWorker',
  elementAttrs: {
    Worker__use_http_session: false,
    Worker__clear_http_session_each_iteration: false
  },
  property: {
    TeardownWorker__on_sample_error: 'start_next_thread',
    TeardownWorker__number_of_threads: '1',
    TeardownWorker__start_interval: '',
    TeardownWorker__main_controller: {
      class: 'LoopController',
      property: {
        LoopController__loops: '1',
        LoopController__continue_forever: false
      }
    }
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.TeardownWorker__on_sample_error': [{ required: true, message: '失败处理不能为空', trigger: 'blur' }],
  'property.TeardownWorker__number_of_threads': [{ required: true, message: '并发数不能为空', trigger: 'blur' }],
  'property.TeardownWorker__main_controller.property.LoopController__loops': [
    { required: true, message: '循环次数不能为空', trigger: 'blur' }
  ]
})
const activeTabName = ref('HTTP')
const showHTTPSettings = computed(() => activeTabName.value === 'HTTP')
const hiddenConfigDot = computed(() => elementData.value.elementAttrs.Worker__use_http_session === false)
const showJsonScriptDialog = ref(false)
const jsonEditorRef = ref()

watch(
  () => elementData.value.elementAttrs.Worker__use_http_session,
  (val) => {
    const clearEachIteration = elementData.value.elementAttrs.Worker__clear_http_session_each_iteration
    if (!val && clearEachIteration === true) {
      elementData.value.elementAttrs.Worker__clear_http_session_each_iteration = false
    }
  }
)

watch(
  () => elementData.value.elementAttrs.Worker__clear_http_session_each_iteration,
  (val) => {
    const enableHTTPSession = elementData.value.elementAttrs.Worker__use_http_session
    if (val && enableHTTPSession === false) {
      elementData.value.elementAttrs.Worker__use_http_session = true
    }
  }
)

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    assignElement(elementData.value, response.result)
  })
})

/**
 * 更新元素编号
 */
const updateElementNo = (val) => {
  elementNo.value = val
  elementData.value.elementNo = val
}

/**
 * 修改元素信息
 */
const modifyElement = async (close = false) => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 修改元素
  await ElementService.modifyElement({ elementNo: elementNo.value, ...elementData.value })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题
    updateTab(elementData.value.elementName)
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
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 新增元素
  const response = await ElementService.createElementChild({
    rootNo: props.metadata.rootNo,
    parentNo: props.metadata.parentNo,
    ...elementData.value
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题和编号
    updateTab(elementData.value.elementName, response.result.elementNo)
    // 更新元素编号
    updateElementNo(response.result.elementNo)
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

/**
 * 查看 Json 脚本
 */
const queryWorkerJson = () => {
  ExecutionService.queryWorkerJson({
    workerNo: elementNo.value,
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
:deep(.el-badge__content) {
  top: 10px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

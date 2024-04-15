<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form ref="elformRef" label-width="140px" :model="elementData" :rules="elementRules">
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <FxInput v-model="elementData.elementName" placeholder="元素名称" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementDesc">
        <FxInput v-model="elementData.elementDesc" placeholder="元素备注" />
      </el-form-item>

      <!-- 元素属性 -->
      <el-form-item label="失败处理：" prop="elementProps.TestWorker__on_sample_error">
        <el-select v-model="elementData.elementProps.TestWorker__on_sample_error" style="width: 100%">
          <el-option label="继续" value="continue" />
          <el-option label="开始下一个用例的循环" value="start_next_thread" />
          <el-option label="开始下一个当前控制器的循环" value="start_next_current_loop" />
          <el-option label="中断当前控制器的循环" value="break_current_loop" />
          <el-option label="停止用例" value="stop_worker" />
          <el-option label="停止测试" value="stop_test" />
          <el-option label="立即停止测试" value="stop_now" />
        </el-select>
      </el-form-item>

      <!-- 并发数 -->
      <!-- <el-form-item label="并发数：" prop="elementProps.TestWorker__number_of_threads">
        <FxInput v-model="elementData.elementProps.TestWorker__number_of_threads" disabled />
      </el-form-item> -->

      <!-- 循环次数 -->
      <el-form-item label="循环次数：" prop="elementProps.TestWorker__main_controller.property.LoopController__loops">
        <FxInput v-model="elementData.elementProps.TestWorker__main_controller.property.LoopController__loops" />
      </el-form-item>

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="HTTP">
          <template #label>
            <el-badge :hidden="hiddenHTTPSettingsDot" type="success" is-dot>HTTP配置</el-badge>
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
          />
        </el-form-item>
        <!-- 是否在每次迭代开始前重新打开一个新的 HTTP 会话 -->
        <el-form-item label="迭代时刷新会话：">
          <el-switch
            v-model="elementData.elementAttrs.Worker__clear_http_session_each_iteration"
            inline-prompt
            :active-icon="Check"
            :inactive-icon="Close"
          />
        </el-form-item>
      </div>
    </el-form>

    <!-- 操作按钮 -->
    <el-affix target=".pymeter-component-container" position="bottom" :offset="60">
      <div class="flexbox-center">
        <template v-if="!creation">
          <el-dropdown
            split-button
            type="primary"
            trigger="click"
            placement="bottom-end"
            style="margin-right: 20px"
            @click="runWorker(metadata.rootNo, elementData.elementNo)"
          >
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
            <span>运 行</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="queryWorkerScript()">展示Json脚本</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-if="creation || unsaved">
          <el-tooltip effect="light" placement="top" :content="shortcutKeyName">
            <el-button type="danger" style="width: 120px" @click="save()">
              <SvgIcon icon-name="pymeter-save" style="margin-right: 5px; font-size: 22px" />
              <span>保 存</span>
            </el-button>
          </el-tooltip>
        </template>
      </div>
    </el-affix>

    <!-- JSON脚本 -->
    <el-dialog v-model="showJsonScriptDialog" center title="Json脚本" width="80%">
      <MonacoEditor ref="jsonEditorRef" language="json" style="height: 400px" :readonly="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'

import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { usePyMeterStore } from '@/store/pymeter'
import { usePyMeterDB } from '@/store/pymeter-db'
import { toHashCode } from '@/utils/object-util'

const checkLoops = (_, value, callback) => {
  if (!value) {
    return callback(new Error('循环次数不能为空'))
  }
  const val = parseInt(value)
  if (!Number.isInteger(val)) {
    return callback(new Error('循环次数必须为整数'))
  } else {
    return val < 1 || val > 100 ? callback(new Error('循环次数仅支持[1-100]')) : callback()
  }
}

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const { runWorker } = useRunnableElement()
const { assignElement, assignMetadata } = useElement()
const { unsaved, metadata, creation, localkey, shortcutKeyName, updateTabName, expandParentNode, refreshElementTree } =
  useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: '测试用例',
  elementDesc: '',
  elementType: 'WORKER',
  elementClass: 'TestWorker',
  elementAttrs: {
    Worker__use_http_session: false,
    Worker__clear_http_session_each_iteration: false
  },
  elementProps: {
    TestWorker__on_sample_error: 'start_next_thread',
    TestWorker__number_of_threads: '1',
    TestWorker__start_interval: '',
    TestWorker__main_controller: {
      class: 'LoopController',
      property: {
        LoopController__loops: '1',
        LoopController__continue_forever: false
      }
    }
  }
})
const elementRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'elementProps.TestWorker__on_sample_error': [{ required: true, message: '失败处理不能为空', trigger: 'blur' }],
  'elementProps.TestWorker__number_of_threads': [{ required: true, message: '并发数不能为空', trigger: 'blur' }],
  'elementProps.TestWorker__main_controller.property.LoopController__loops': [
    { required: true, trigger: 'blur', validator: checkLoops }
  ]
}

const activeTabName = ref('HTTP')
const showHTTPSettings = computed(() => activeTabName.value === 'HTTP')
const hiddenHTTPSettingsDot = computed(() => elementData.value.elementAttrs.Worker__use_http_session === false)

const elformRef = ref()
const jsonEditorRef = ref()
const showJsonScriptDialog = ref(false)

// 联动编辑
watch(
  () => elementData.value.elementAttrs.Worker__use_http_session,
  (val) => {
    const clearEachIteration = elementData.value.elementAttrs.Worker__clear_http_session_each_iteration
    if (!val && clearEachIteration === true) {
      elementData.value.elementAttrs.Worker__clear_http_session_each_iteration = false
    }
  }
)

// 联动编辑
watch(
  () => elementData.value.elementAttrs.Worker__clear_http_session_each_iteration,
  (val) => {
    const enableHTTPSession = elementData.value.elementAttrs.Worker__use_http_session
    if (val && enableHTTPSession === false) {
      elementData.value.elementAttrs.Worker__use_http_session = true
    }
  }
)

watch(
  elementData,
  debounce((localdata) => {
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
  assignMetadata(metadata.value, offline.meta)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  const response = await ElementService.queryElementInfo({ elementNo: elementData.value.elementNo })
  assignElement(elementData.value, response.data)
  assignMetadata(metadata.value, { hashcode: toHashCode(elementData.value) })
}

/**
 * 修改元素
 */
const modifyElement = async () => {
  // 修改元素
  await ElementService.modifyElement(elementData.value)
}

/**
 * 新增元素
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
 * 查看 Json 脚本
 */
const queryWorkerScript = () => {
  ExecutionService.queryWorkerJson({
    workerNo: elementData.value.elementNo,
    datasets: pymeterStore.selectedDatasets,
    useCurrentValue: pymeterStore.useCurrentValue
  }).then((response) => {
    showJsonScriptDialog.value = true
    nextTick(() => {
      jsonEditorRef.value.setValue(JSON.stringify(response.data))
      setTimeout(() => {
        jsonEditorRef.value.formatDocument()
      }, 200)
    })
  })
}

/**
 * 提交数据
 */
const save = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
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
:deep(.el-badge__content) {
  top: 8px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

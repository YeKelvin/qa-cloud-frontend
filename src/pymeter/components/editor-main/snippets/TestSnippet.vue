<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-width="100px"
      label-position="right"
      inline-message
      :model="elementData"
      :rules="elementRules"
    >
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <el-input v-model="elementData.elementName" placeholder="元素名称" clearable />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementDesc">
        <el-input v-model="elementData.elementDesc" placeholder="元素备注" clearable />
      </el-form-item>

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="PARAMETERS">
          <template #label>
            <el-badge :hidden="hiddenParametersDot" type="success" is-dot>参数定义</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="HTTP_SETTINGS">
          <template #label>
            <el-badge :hidden="!elementData.elementAttrs.use_http_session" type="success" is-dot>HTTP配置</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 参数设置 -->
      <div v-if="showParametersTab" class="tab-pane">
        <ParameterTable v-model="elementData.elementAttrs.TestSnippet__parameters" />
      </div>

      <!-- HTTP 设置 -->
      <div v-if="showHttpSettingsTab" class="tab-pane">
        <!-- 是否使用 HTTP 会话 -->
        <el-form-item label="使用会话：">
          <el-switch
            v-model="elementData.elementAttrs.use_http_session"
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
          <template v-if="!isEmpty(parameterData)">
            <el-button type="primary" style="width: 120px" @click="showArgumentsDialog = true">
              <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
              运 行
            </el-button>
          </template>
          <template v-else>
            <el-dropdown
              split-button
              trigger="click"
              type="primary"
              style="margin-left: 10px"
              placement="bottom-end"
              @click="runTestSnippet(elementData.elementNo)"
            >
              <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
              <span style="margin-left: 5px">运 行</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="querySnippetJson()">查询脚本</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </template>
        <template v-if="creation || unsaved">
          <el-tooltip effect="light" placement="top" :content="shortcutKeyName">
            <el-button type="danger" style="width: 120px; margin-left: 20px" @click="save()">
              <SvgIcon icon-name="pymeter-save" style="margin-right: 5px; font-size: 22px" />
              <span>保 存</span>
            </el-button>
          </el-tooltip>
        </template>
      </div>
    </el-affix>

    <!-- 实参对话框 -->
    <el-dialog v-model="showArgumentsDialog" width="60%" center>
      <template #header>
        <span style="font-size: 16px; color: #606266">设置片段参数</span>
      </template>
      <template #default>
        <ArgumentTable :data="argumentData" />
        <el-tag type="danger" style="margin-top: 10px" disable-transitions>注意：片段参数不支持函数</el-tag>
      </template>
      <template #footer>
        <el-dropdown trigger="click" type="danger" placement="bottom-end" split-button @click="runSnippet()">
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
          <span>运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="querySnippetJson()">查询脚本</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-dialog>

    <!-- JSON脚本 -->
    <el-dialog v-model="showJsonScriptDialog" title="Json脚本" width="80%" center>
      <MonacoEditor ref="jsonEditorRef" language="json" style="height: 400px" :readonly="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { usePyMeterStore } from '@/store/pymeter'
import { usePyMeterDB } from '@/store/pymeter-db'
import { useWorkspaceStore } from '@/store/workspace'
import { toHashCode } from '@/utils/object-util'
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from 'lodash-es'
import ArgumentTable from './TestSnippetArgumentTable.vue' // 实参
import ParameterTable from './TestSnippetParameterTable.vue' // 形参

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()
const { runTestSnippet } = useRunnableElement()
const { assignElement, assignMetadata } = useElement()
const { unsaved, metadata, creation, localkey, shortcutKeyName, updateTabName } = useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: '测试片段',
  elementDesc: '',
  elementType: 'SNIPPET',
  elementClass: 'TestSnippet',
  elementAttrs: {
    TestSnippet__parameters: [],
    TestSnippet__use_http_session: false
  },
  elementProps: {}
})
const elementRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
}
const argumentData = ref([])
const parameterData = computed(() => elementData.value.elementAttrs.TestSnippet__parameters)
const hiddenParametersDot = computed(() => {
  if (parameterData.value.length === 0) {
    return true
  }
  if (parameterData.value.length === 1) {
    const param = parameterData.value[0]
    if (isEmpty(param.name) && isEmpty(param.default) && isEmpty(param.desc)) return true
  }
  return false
})

const activeTabName = ref('PARAMETERS')
const showArgumentsDialog = ref(false)
const showJsonScriptDialog = ref(false)

const showParametersTab = computed(() => activeTabName.value === 'PARAMETERS')
const showHttpSettingsTab = computed(() => activeTabName.value === 'HTTP_SETTINGS')
const additionalVariables = computed(() => {
  if (argumentData.value.length === 0) return {}
  const vars = {}
  argumentData.value.forEach((item) => {
    vars[item.name] = item.default
  })
  return vars
})

const elformRef = ref()
const jsonEditorRef = ref()

watch(
  elementData,
  debounce((localdata) => {
    // 更新实参数据
    argumentData.value = parameterData.value
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
  const backendData = response.result
  backendData.elementAttrs.TestSnippet__parameters.push({ name: '', default: '', desc: '' })
  assignElement(elementData.value, backendData)
  assignMetadata(metadata.value, { hashcode: toHashCode(elementData.value) })
}

/**
 * 移除空白的参数
 */
const removeBlankParameter = () => {
  if (isEmpty(parameterData.value)) return
  elementData.value.elementAttrs.TestSnippet__parameters = parameterData.value.filter(
    (param) => !isEmpty(param.name) || !isEmpty(param.default) || !isEmpty(param.desc)
  )
}

/**
 * 校验参数名称是否为空
 */
const checkParameter = () => {
  let pass = true
  for (let i = 0; i < parameterData.value.length; i++) {
    if (isEmpty(parameterData.value[i].name)) {
      pass = false
      break
    }
  }
  if (!pass) ElMessage({ message: '参数名称不能为空', type: 'error' })
  return pass
}

/**
 * 修改元素
 */
const modifyElement = async () => {
  // 移除空白参数
  removeBlankParameter()
  // 校验参数名称不能为空
  if (!checkParameter()) return
  // 修改元素
  await ElementService.modifyElement(elementData.value)
  // 刷新集合列表
  pymeterStore.refreshCollections()
  // 刷新元素列表
  pymeterStore.refreshElementTree()
}

/**
 * 创建元素
 */
const createElement = async () => {
  // 工作空间非空校验
  if (isEmpty(workspaceStore.workspaceNo)) {
    ElMessage({ message: '请先选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  // 移除空白参数
  removeBlankParameter()
  // 校验参数名称不能为空
  if (!checkParameter()) return
  // 新增元素
  const response = await ElementService.createElement(elementData.value)
  // 提取元素编号
  const elementNo = response.result.elementNo
  // 移除离线数据
  offlineDB.removeItem(props.editorNo)
  // 更新Tab序列号
  metadata.value.sn = elementNo
  // 更新元素编号
  elementData.value.elementNo = elementNo
  // 刷新集合列表
  pymeterStore.refreshCollections()
  // 刷新元素列表
  pymeterStore.refreshElementTree()
  // 添加至已选列表中
  pymeterStore.addSelectedCollection(elementNo)
  // 滚动至底部
  pymeterStore.scrollToElementTreeBottom()
}

/**
 * 执行脚本
 */
const runSnippet = async () => {
  // 打开对话框
  showArgumentsDialog.value = false
  // 运行
  await runTestSnippet(elementData.value.elementNo, additionalVariables.value)
}

/**
 * 查看 Json 脚本
 */
const querySnippetJson = () => {
  showArgumentsDialog.value = false
  ExecutionService.querySnippetJson({
    collectionNo: elementData.value.elementNo,
    datasets: pymeterStore.selectedDatasets,
    useCurrentValue: pymeterStore.useCurrentValue,
    variables: additionalVariables.value
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

:deep(.el-badge__content) {
  top: 10px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}

:deep(.el-button-group .el-button:first-child) {
  width: 90px;
}
</style>

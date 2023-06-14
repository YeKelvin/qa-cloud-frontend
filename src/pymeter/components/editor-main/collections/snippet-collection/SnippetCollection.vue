<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="100px"
      style="width: 100%"
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

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="PARAMETERS">
          <template #label>
            <el-badge :hidden="isEmpty(parametersData)" type="success" is-dot>参数定义</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="HTTP_SETTINGS">
          <template #label>
            <el-badge :hidden="!elementInfo.attributes.use_http_session" type="success" is-dot>HTTP配置</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 参数设置 -->
      <div v-if="showParametersTab">
        <ParameterTable :data="parametersData" :edit-mode="editMode" />
      </div>

      <!-- HTTP 设置 -->
      <div v-if="showHttpSettingsTab">
        <!-- 是否使用 HTTP 会话 -->
        <el-form-item label="使用会话：">
          <el-switch
            v-model="elementInfo.attributes.use_http_session"
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
        <template v-if="!isEmpty(argumentsData)">
          <el-button type="danger" @click="showArgumentsDialog = true">
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
            运 行
          </el-button>
        </template>
        <template v-else>
          <el-dropdown
            split-button
            trigger="click"
            type="danger"
            style="margin-left: 10px"
            placement="bottom"
            @click="executeSnippetCollection(elementNo)"
          >
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
            <span style="margin-left: 5px">运 行</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="querySnippetsJson()">查询脚本(JSON)</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
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

    <el-dialog v-model="showArgumentsDialog" width="60%" center>
      <template #header>
        <span style="color: #606266; font-family: inherit">设置片段参数</span>
      </template>

      <template #default>
        <ArgumentTable :data="argumentsData" />
        <el-tag type="danger" style="margin-top: 10px" disable-transitions>注意：片段参数不支持函数</el-tag>
      </template>

      <template #footer>
        <el-button style="margin-right: 10px" :icon="Close" @click="showArgumentsDialog = false">取 消</el-button>
        <el-dropdown trigger="click" type="danger" placement="bottom" split-button @click="executeCollection()">
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
          <span>运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="querySnippetsJson()">查询脚本(JSON)</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-dialog>

    <el-dialog v-model="showJsonScriptDialog" title="Json脚本" width="80%" center>
      <MonacoEditor ref="jsonEditorRef" language="json" style="height: 400px" :read-only="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import { isBlank, isBlankAll } from '@/utils/string-util'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import EditorProps from '@/pymeter/composables/editor.props'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import ArgumentTable from './SnippetCollectionArgumentTable.vue' // 实参
import ParameterTable from './SnippetCollectionParameterTable.vue' // 形参

const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()
const { assignElement } = useElement()
const { executeSnippetCollection } = useRunnableElement()
const { editMode, queryMode, modifyMode, createMode, functions, editNow, setReadonly, updateTab, closeTab } =
  useEditor(props)

const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
  elementNo: '',
  elementName: '脚本片段',
  elementRemark: '',
  elementType: 'COLLECTION',
  elementClass: 'SnippetCollection',
  property: {},
  attributes: {
    parameters: [],
    use_http_session: false
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
})
const activeTabName = ref('PARAMETERS')
const parametersData = ref([]) // 形参
const argumentsData = ref([]) // 实参
const showArgumentsDialog = ref(false)
const showJsonScriptDialog = ref(false)
const jsonEditorRef = ref()
const showParametersTab = computed(() => activeTabName.value === 'PARAMETERS')
const showHttpSettingsTab = computed(() => activeTabName.value === 'HTTP_SETTINGS')
const additionalVariables = computed(() => {
  if (argumentsData.value.length === 0) return {}
  const vars = {}
  argumentsData.value.forEach((item) => {
    vars[item.name] = item.default
  })
  return vars
})

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    assignElement(elementInfo.value, response.result)
    parametersData.value = response.result.attributes.parameters
    argumentsData.value = response.result.attributes.parameters
  })
})

/**
 * 更新元素编号
 */
const updateElementNo = (val) => {
  elementNo.value = val
  elementInfo.value.elementNo = val
}

/**
 * 更新元素属性
 */
const updateElementProperty = () => {
  elementInfo.value.attributes.parameters = parametersData.value.filter(
    (item) => !isBlankAll(item.name, item.default, item.desc)
  )
}

/**
 * 移除表格中的空行
 */
const removeAllBlankRow = () => {
  if (!isEmpty(parametersData.value)) {
    parametersData.value = parametersData.value.filter((row) => !isBlankAll(row.name, row.default))
  }
}

/**
 * 校验参数名称是否为空
 */
const checkParameter = () => {
  let pass = true
  elementInfo.value.attributes.parameters.forEach((item) => {
    if (isBlank(item.name)) {
      pass = false
      return
    }
  })
  if (!pass) ElMessage({ message: '参数名称不能为空', type: 'error' })
  return pass
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
  // 更新元素属性
  updateElementProperty()
  // 校验参数名称不能为空
  if (!checkParameter()) return
  // 修改元素
  await ElementService.modifyElement({ elementNo: elementNo.value, ...elementInfo.value })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 移除表格里的空行
    removeAllBlankRow()
    // 更新 tab 标题
    updateTab(elementInfo.value.elementName)
    // 更新实参数据
    argumentsData.value = parametersData.value
  }
  // 重新查询集合列表
  pymeterStore.refreshCollections()
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
  // 工作空间非空校验
  if (isEmpty(workspaceStore.workspaceNo)) {
    ElMessage({ message: '请先选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 更新元素属性
  updateElementProperty()
  // 校验参数名称不能为空
  if (!checkParameter()) return
  // 新增元素
  const response = await ElementService.createCollection({
    workspaceNo: workspaceStore.workspaceNo,
    ...elementInfo.value
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 移除表格里的空行
    removeAllBlankRow()
    // 更新 tab 标题和编号
    updateTab(elementInfo.value.elementName, response.result.elementNo)
    // 更新元素编号
    updateElementNo(response.result.elementNo)
    // 更新实参数据
    argumentsData.value = parametersData.value
  }
  // 重新查询集合列表
  pymeterStore.refreshCollections()
  // 新增成功后立即在列表中展示
  pymeterStore.addSelectedCollection(response.result.elementNo)
  // 滚动至底部
  pymeterStore.scrollToElementTreeBottom()
  // 成功提示
  ElMessage({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
  // 需要关闭 tab
  if (close) {
    closeTab()
  }
}

/**
 * 根据 collectionNo 执行脚本
 */
const executeCollection = async () => {
  showArgumentsDialog.value = false
  await executeSnippetCollection(elementNo.value, additionalVariables.value)
}

/**
 * 查看 Json 脚本
 */
const querySnippetsJson = () => {
  showArgumentsDialog.value = false
  ExecutionService.querySnippetsJson({
    collectionNo: elementNo.value,
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

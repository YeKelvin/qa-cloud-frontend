<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="120px"
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

      <!-- 数据库选择框 -->
      <el-form-item label="数据库：" prop="elementAttrs.SQLSampler__engine_no">
        <el-select v-model="elementData.elementAttrs.SQLSampler__engine_no" style="width: 100%" :disabled="queryMode">
          <el-option v-for="item in engineList" :key="item.dbNo" :label="item.dbName" :value="item.dbNo">
            <span class="database-type-option">
              <span>{{ item.dbName }}</span>
              <el-tag type="danger" size="small" disable-transitions>{{ DatabaseType[item.dbType] }}</el-tag>
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 变量名称 -->
      <el-form-item label="变量名称：" prop="property.SQLSampler__result_name">
        <el-input
          v-model="elementData.property.SQLSampler__result_name"
          placeholder="用于存储查询结果集，默认=rows"
          clearable
          :readonly="queryMode"
        />
      </el-form-item>

      <!-- 标签栏 -->
      <div style="display: flex; align-items: center; justify-content: space-between">
        <!-- 标签页头 -->
        <el-tabs v-model="activeTabName" style="width: 100%">
          <el-tab-pane name="STATEMENT">
            <template #label>
              <el-badge :hidden="hiddenStatementDot" type="success" is-dot>SQL语句</el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane name="SETTINGS">
            <template #label>
              <el-badge :hidden="hiddenSettingsDot" type="success" is-dot>查询设置</el-badge>
            </template>
          </el-tab-pane>
        </el-tabs>
        <!-- 运行按钮 -->
        <el-button v-show="queryMode" type="danger" style="margin-left: 10px" @click="executeSampler(elementNo)">
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
          运 行
        </el-button>
      </div>

      <div v-show="showSettingsTab">
        <!-- 结果数限制 -->
        <el-form-item label="结果大小限制：" prop="property.SQLSampler__limit">
          <el-input
            v-model="elementData.property.SQLSampler__limit"
            placeholder="默认=10"
            style="width: 300px"
            clearable
            :readonly="queryMode"
          >
            <template #append>条</template>
          </el-input>
        </el-form-item>

        <!-- 超时时间 -->
        <el-form-item label="超时时间：" prop="property.SQLSampler__query_timeout">
          <el-input
            v-model="elementData.property.SQLSampler__query_timeout"
            placeholder="默认=10000"
            style="width: 300px"
            clearable
            :readonly="queryMode"
          >
            <template #append>毫秒</template>
          </el-input>
        </el-form-item>
      </div>

      <!-- SQL语句 -->
      <div v-show="showStatementTab">
        <MonacoEditor
          ref="codeEditorRef"
          v-model="elementData.property.SQLSampler__statement"
          language="sql"
          style="margin-bottom: 20px"
          :readonly="queryMode"
        />
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
import * as DatabaseService from '@/api/script/database'
import { DatabaseType } from '@/api/enum'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { useWorkspaceStore } from '@/store/workspace'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import EditorProps from '@/pymeter/composables/editor.props'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps(EditorProps)
const workspaceStore = useWorkspaceStore()
const { assignElement } = useElement()
const { executeSampler } = useRunnableElement()
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
  elementName: 'SQL请求',
  elementDesc: '',
  elementType: 'SAMPLER',
  elementClass: 'SQLSampler',
  elementAttrs: {
    SQLSampler__engine_no: ''
  },
  property: {
    SQLSampler__statement: '',
    SQLSampler__limit: '',
    SQLSampler__result_name: '',
    SQLSampler__query_timeout: ''
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'elementAttrs.SQLSampler__engine_no': [{ required: true, message: '数据库编号不能为空', trigger: 'blur' }],
  'property.SQLSampler__statement': [{ required: true, message: 'SQL不能为空', trigger: 'blur' }]
})
const engineList = ref([])
const codeEditorRef = ref()
const activeTabName = ref('STATEMENT')
const showStatementTab = computed(() => activeTabName.value === 'STATEMENT')
const showSettingsTab = computed(() => activeTabName.value === 'SETTINGS')
const hiddenStatementDot = computed(() => elementData.value.property.SQLSampler__statement === '')
const hiddenSettingsDot = computed(() => {
  const elprop = elementData.value.property
  return elprop.SQLSampler__limit === '' && elprop.SQLSampler__query_timeout === ''
})

onMounted(() => {
  // 查询所有数据库
  DatabaseService.queryDatabaseEngineAll({ workspaceNo: workspaceStore.workspaceNo }).then((response) => {
    engineList.value = response.result
  })

  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    assignElement(elementData.value, response.result)
    codeEditorRef.value.setValue(response.result.property.SQLSampler__statement)
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
    updateTab(elementData.value.elementName, response.result[0])
    // 更新元素编号
    updateElementNo(response.result[0])
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
.database-type-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-tag {
  margin-right: 5px;
}

:deep(.el-input-group__append) {
  width: 60px;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  cursor: auto;
}

:deep(.el-badge__content) {
  top: 10px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

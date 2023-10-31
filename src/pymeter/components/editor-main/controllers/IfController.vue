<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="100px"
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

      <!-- if条件 -->
      <el-form-item label="表达式：" prop="property.IfController__condition">
        <MonacoEditor
          ref="codeEditorRef"
          v-model="elementData.property.IfController__condition"
          language="python"
          line-numbers="off"
          style="height: 100px"
          :readonly="queryMode"
        />
        <el-tag type="danger" style="font-size: 14px" disable-transitions>注意：仅支持单行表达式</el-tag>
      </el-form-item>

      <!-- 操作按钮 -->
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
    </el-form>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import useEditor from '@/pymeter/composables/useEditor'
import EditorProps from '@/pymeter/composables/editor.props'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps(EditorProps)
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
  elementName: 'IF控制器',
  elementDesc: '',
  elementType: 'CONTROLLER',
  elementClass: 'IfController',
  property: {
    IfController__condition: ''
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.IfController__condition': [{ required: true, message: '条件不能为空', trigger: 'blur' }]
})
const codeEditorRef = ref()

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementData.value = response.result
    codeEditorRef.value.setValue(response.result.property.IfController__condition)
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
 * 修改元素
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
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  cursor: auto;
}
</style>

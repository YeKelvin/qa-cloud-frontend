<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="100px"
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

      <!-- 循环延迟时间 -->
      <el-form-item label="间隔时间：" prop="property.ForeachController__delay">
        <el-input
          v-model="elementInfo.property.ForeachController__delay"
          placeholder="间隔时间(ms)"
          clearable
          :readonly="queryMode"
        />
      </el-form-item>

      <!-- for变量 -->
      <el-form-item prop="property.ForeachController__target">
        <template #label>
          <span style="font-size: 16px">for：</span>
        </template>
        <el-input
          v-model="elementInfo.property.ForeachController__target"
          placeholder="目标变量名称"
          clearable
          :readonly="queryMode"
        />
      </el-form-item>

      <!-- in对象 -->
      <el-form-item prop="property.ForeachController__iter">
        <template #label>
          <span style="font-size: 16px">in：</span>
        </template>
        <el-radio-group
          v-model="elementInfo.property.ForeachController__type"
          style="margin-bottom: 10px"
          :disabled="queryMode"
        >
          <el-radio label="OBJECT">可迭代对象</el-radio>
          <el-radio label="CUSTOM">自定义声明</el-radio>
        </el-radio-group>
        <el-input
          v-if="elementInfo.property.ForeachController__type == 'OBJECT'"
          v-model="elementInfo.property.ForeachController__iter"
          placeholder="可迭代对象名称"
          clearable
          :readonly="queryMode"
        >
          <template #prepend>${</template>
          <template #append>}</template>
        </el-input>
        <MonacoEditor
          v-else
          ref="editorRef"
          v-model="elementInfo.property.ForeachController__iter"
          language="python"
          line-numbers="off"
          style="height: 100px"
          :readonly="queryMode"
        />
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
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
const elementInfo = ref({
  elementNo: '',
  elementName: '遍历控制器',
  elementRemark: '',
  elementType: 'CONTROLLER',
  elementClass: 'ForeachController',
  property: {
    ForeachController__target: '',
    ForeachController__iter: '',
    ForeachController__type: 'OBJECT',
    ForeachController__delay: ''
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.ForeachController__target': [{ required: true, message: '目标变量不能为空', trigger: 'blur' }],
  'property.ForeachController__iter': [{ required: true, message: '迭代对象或声明不能为空', trigger: 'blur' }]
})
const editorRef = ref()

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
    if (response.result.property.ForeachController__type === 'CUSTOM') {
      editorRef.value.setValue(response.result.property.ForeachController__iter)
    }
  })
})

watch(
  () => elementInfo.value.property.ForeachController__type,
  (val) => {
    if (val === 'OBJECT') return
    nextTick(() => {
      editorRef.value.setValue(elementInfo.value.property.ForeachController__iter)
    })
  }
)

/**
 * 更新元素编号
 */
const updateElementNo = (val) => {
  elementNo.value = val
  elementInfo.value.elementNo = val
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
  await ElementService.modifyElement({ elementNo: elementNo.value, ...elementInfo.value })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题
    updateTab(elementInfo.value.elementName)
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
  const response = await ElementService.createElementChildren({
    rootNo: props.metadata.rootNo,
    parentNo: props.metadata.parentNo,
    children: [elementInfo.value]
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题和编号
    updateTab(elementInfo.value.elementName, response.result[0])
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
:deep(.el-input-group__prepend) {
  width: 80px;
}

:deep(.el-input-group__append) {
  width: 60px;
}
</style>

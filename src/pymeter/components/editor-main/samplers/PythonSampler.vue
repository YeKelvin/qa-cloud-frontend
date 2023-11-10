<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="100px"
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

      <!-- 说明 -->
      <el-form-item label="内置变量：">
        <span style="display: flex; flex-wrap: wrap; align-items: center">
          <el-tag style="margin-right: 10px" disable-transitions>log</el-tag>
          <el-tag style="margin-right: 10px" disable-transitions>ctx</el-tag>
          <el-tag style="margin-right: 10px" disable-transitions>vars</el-tag>
          <el-tag style="margin-right: 10px" disable-transitions>props</el-tag>
          <el-tag style="margin-right: 10px" disable-transitions>prev</el-tag>
          <el-tag style="margin-right: 10px" disable-transitions>result</el-tag>
        </span>
      </el-form-item>

      <!-- 元素脚本 -->
      <PythonEditor
        ref="codeEditorRef"
        v-model="elementData.property.PythonSampler__script"
        type="PYTHON"
        phase="SAMPLER"
        height="400px"
        runnable
        @run="executeSampler(elementData.rootNo, elementData.elementNo)"
      />

      <!-- 操作按钮 -->
      <template v-if="unsaved">
        <SaveButton :tips="shortcutKeyName" @click="save()" />
      </template>
    </el-form>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import PythonEditor from '@/pymeter/components/editor-main/common/PythonEditor.vue'
import SaveButton from '@/pymeter/components/editor-main/common/SaveButton.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { usePyMeterDB } from '@/store/pymeter-db'
import { toHashCode } from '@/utils/object-util'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'

const props = defineProps(EditorProps)
const emit = defineEmits(EditorEmits)
const { executeSampler } = useRunnableElement()
const {
  unsaved,
  metadata,
  creation,
  localkey,
  shortcutKeyName,
  updateTabName,
  updateTabMeta,
  expandParentNode,
  refreshElementTree
} = useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.elementNo,
  elementName: 'Python请求',
  elementDesc: '',
  elementType: 'SAMPLER',
  elementClass: 'PythonSampler',
  property: {
    PythonSampler__script: ''
  }
})
const elementRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
}
const elformRef = ref()
const codeEditorRef = ref()

watch(
  elementData,
  debounce((localdata) => {
    console.log('watch')
    // 如果前后端数据一致则代表数据未更改
    if (metadata.value.hashcode === toHashCode(localdata)) {
      unsaved.value = false
      return
    }
    console.log('存离线')
    // 标记数据未保存
    unsaved.value = true
    // 存储离线数据
    offlineDB.setItem(localkey.value, JSON.parse(JSON.stringify({ data: localdata, meta: metadata.value })))
  }, 500),
  { deep: true, flush: 'sync' }
)

onMounted(async () => {
  // 优先查询离线数据
  if (unsaved.value) {
    queryOfflineData()
  } else {
    // 新增模式无需读取任何数据
    if (creation.value) return
    // 查询后端数据
    queryBackendData()
  }
})

/**
 * 查询离线数据
 */
const queryOfflineData = async () => {
  const offline = await offlineDB.getItem(localkey.value)
  Object.assign(elementData.value, offline.data)
  Object.assign(metadata.value, offline.meta)
  codeEditorRef.value.setValue(offline.data.property.PythonSampler__script)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  const response = await ElementService.queryElementInfo({ elementNo: elementData.value.elementNo })
  Object.assign(elementData.value, response.result)
  Object.assign(metadata.value, { hashcode: toHashCode(elementData.value) })
  codeEditorRef.value.setValue(response.result.property.PythonSampler__script)
}

/**
 * 修改元素信息
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
  const elementNo = response.result.elementNo
  // 更新元素编号
  elementData.value.elementNo = elementNo
  // 更新 tab 元数据
  updateTabMeta({ sn: elementNo, elementNo: elementNo })
  // 展开父节点
  expandParentNode()
}

/**
 * 保存数据至后端
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
  // 保存成功后移除离线数据
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

<style lang="scss" scoped></style>

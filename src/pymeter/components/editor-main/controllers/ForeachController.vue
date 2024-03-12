<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form ref="elformRef" label-width="100px" :model="elementData" :rules="elementRules">
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <FxInput v-model="elementData.elementName" placeholder="元素名称" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementDesc">
        <FxInput v-model="elementData.elementDesc" placeholder="元素备注" />
      </el-form-item>

      <!-- 循环延迟时间 -->
      <el-form-item label="间隔时间：" prop="elementProps.ForeachController__delay">
        <FxInput v-model="elementData.elementProps.ForeachController__delay" placeholder="间隔时间(ms)" />
      </el-form-item>

      <!-- 变量名称 -->
      <el-form-item label="变量名称：" prop="elementProps.ForeachController__target">
        <FxInput v-model="elementData.elementProps.ForeachController__target" placeholder="目标变量名称" />
      </el-form-item>

      <!-- 遍历数组 -->
      <el-form-item label="遍历数组：" prop="elementProps.ForeachController__iter">
        <div style="width: 100%; margin-bottom: 20px">
          <el-radio-group v-model="elementData.elementProps.ForeachController__type">
            <el-radio value="OBJECT">从变量中读取数组</el-radio>
            <el-radio value="CUSTOM">自定义数组</el-radio>
          </el-radio-group>
          <template v-if="elementData.elementProps.ForeachController__type == 'OBJECT'">
            <FxInput
              v-model="elementData.elementProps.ForeachController__iter"
              placeholder="对象名称"
              style="width: 100%"
            >
              <template #prepend>${</template>
              <template #append>}</template>
            </FxInput>
          </template>
          <template v-else>
            <FxEditor
              ref="editorRef"
              v-model="elementData.elementProps.ForeachController__iter"
              language="python"
              line-numbers="off"
              style="height: 100px"
            />
          </template>
        </div>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <template v-if="creation || unsaved">
      <SaveButton :tips="shortcutKeyName" @click="save()" />
    </template>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'
import FxEditor from '@/pymeter/components/editor-main/others/FunctionEditor.vue'
import SaveButton from '@/pymeter/components/editor-main/others/SaveButton.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import { usePyMeterDB } from '@/store/pymeter-db'
import { toHashCode } from '@/utils/object-util'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const { assignElement, assignMetadata } = useElement()
const { unsaved, metadata, creation, localkey, shortcutKeyName, updateTabName, expandParentNode, refreshElementTree } =
  useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: 'Foreach循环',
  elementDesc: '',
  elementType: 'CONTROLLER',
  elementClass: 'ForeachController',
  elementAttrs: {},
  elementProps: {
    ForeachController__target: '',
    ForeachController__iter: '',
    ForeachController__type: 'OBJECT',
    ForeachController__delay: ''
  }
})
const elementRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'elementProps.ForeachController__target': [{ required: true, message: '变量名称不能为空', trigger: 'blur' }],
  'elementProps.ForeachController__iter': [{ required: true, message: '遍历数组不能为空', trigger: 'blur' }]
}
const elformRef = ref()
const editorRef = ref()

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

watch(
  () => elementData.value.elementProps.ForeachController__type,
  (val) => {
    if (val === 'OBJECT') return
    nextTick(() => {
      editorRef.value.setValue(elementData.value.elementProps.ForeachController__iter)
    })
  }
)

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
:deep(.FxInput-group__prepend) {
  width: 80px;
}

:deep(.FxInput-group__append) {
  width: 60px;
}
</style>

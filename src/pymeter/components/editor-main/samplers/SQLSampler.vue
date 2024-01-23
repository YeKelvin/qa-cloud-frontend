<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-width="120px"
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

      <!-- 数据库选择框 -->
      <el-form-item label="数据库：" prop="elementAttrs.SQLSampler__engine_no">
        <el-select v-model="elementData.elementAttrs.SQLSampler__engine_no" style="width: 100%">
          <el-option
            v-for="item in engineList"
            :key="item.databaseNo"
            :label="item.databaseName"
            :value="item.databaseNo"
          >
            <span class="database-type-option">
              <span>{{ item.databaseName }}</span>
              <el-tag type="danger" size="small" disable-transitions>{{ DatabaseType[item.dbType] }}</el-tag>
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 变量名称 -->
      <el-form-item label="变量名称：" prop="elementProps.SQLSampler__result_name">
        <el-input
          v-model="elementData.elementProps.SQLSampler__result_name"
          placeholder="用于存储查询结果集合的变量名称"
          clearable
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
        <el-button
          type="primary"
          style="height: 30px; border-bottom-right-radius: 0; border-bottom-left-radius: 0"
          @click="run()"
        >
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
          运 行
        </el-button>
      </div>

      <div v-show="showSettingsTab">
        <!-- 结果数限制 -->
        <el-form-item label="结果数量限制：" prop="elementProps.SQLSampler__limit">
          <el-input
            v-model="elementData.elementProps.SQLSampler__limit"
            placeholder="默认=10"
            style="width: 300px"
            clearable
          >
            <template #append>条</template>
          </el-input>
        </el-form-item>

        <!-- 超时时间 -->
        <el-form-item label="超时时间：" prop="elementProps.SQLSampler__query_timeout">
          <el-input
            v-model="elementData.elementProps.SQLSampler__query_timeout"
            placeholder="默认=10000"
            style="width: 300px"
            clearable
          >
            <template #append>毫秒</template>
          </el-input>
        </el-form-item>
      </div>

      <!-- SQL语句 -->
      <div v-show="showStatementTab" style="margin-bottom: 20px">
        <MonacoEditor ref="editorRef" v-model="elementData.elementProps.SQLSampler__statement" language="sql" />
      </div>
    </el-form>

    <!-- 操作按钮 -->
    <template v-if="creation || unsaved">
      <SaveButton :tips="shortcutKeyName" @click="save()" />
    </template>
  </div>
</template>

<script setup>
import { DatabaseType } from '@/api/enum'
import * as ElementService from '@/api/script/element'
import SaveButton from '@/pymeter/components/editor-main/common/SaveButton.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { usePyMeterDB } from '@/store/pymeter-db'
import { useWorkspaceStore } from '@/store/workspace'
import { toHashCode } from '@/utils/object-util'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from 'lodash-es'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const workspaceStore = useWorkspaceStore()
const { runSampler, runOffline } = useRunnableElement()
const { assignElement, assignMetadata } = useElement()
const { unsaved, metadata, creation, localkey, shortcutKeyName, updateTabName, expandParentNode, refreshElementTree } =
  useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: '数据库请求',
  elementDesc: '',
  elementType: 'SAMPLER',
  elementClass: 'SQLSampler',
  elementAttrs: {
    SQLSampler__engine_no: ''
  },
  elementProps: {
    SQLSampler__statement: '',
    SQLSampler__limit: '',
    SQLSampler__result_name: 'rows',
    SQLSampler__query_timeout: ''
  }
})
const elementRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'elementAttrs.SQLSampler__engine_no': [{ required: true, message: '数据库不能为空', trigger: 'blur' }],
  'elementProps.SQLSampler__statement': [{ required: true, message: 'SQL不能为空', trigger: 'blur' }],
  'elementProps.SQLSampler__result_name': [{ required: true, message: '变量名称不能为空', trigger: 'blur' }]
}

const activeTabName = ref('STATEMENT')
const showSettingsTab = computed(() => activeTabName.value === 'SETTINGS')
const showStatementTab = computed(() => activeTabName.value === 'STATEMENT')
const hiddenStatementDot = computed(() => isEmpty(elementData.value.elementProps.SQLSampler__statement))
const hiddenSettingsDot = computed(
  () =>
    isEmpty(elementData.value.elementProps.SQLSampler__limit) &&
    isEmpty(elementData.value.elementProps.SQLSampler__query_timeout)
)

const engineList = ref([])
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
  // 查询所有数据库
  const response = await ElementService.queryDatabaseEngineAll({ workspaceNo: workspaceStore.workspaceNo })
  engineList.value = response.result

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
  editorRef.value.setValue(offline.data.elementProps.SQLSampler__statement)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  const response = await ElementService.queryElementInfo({ elementNo: elementData.value.elementNo })
  assignElement(elementData.value, response.result)
  assignMetadata(metadata.value, { hashcode: toHashCode(elementData.value) })
  editorRef.value.setValue(response.result.elementProps.SQLSampler__statement)
}

/**
 * 运行元素
 */
const run = () => {
  if (creation.value) {
    runOffline(metadata.value.rootNo, metadata.value.parentNo, props.editorNo)
  } else {
    runSampler(metadata.value.rootNo, elementData.value.elementNo)
  }
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
  const elementNo = response.result.elementNo
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

:deep(.el-badge__content) {
  top: 10px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

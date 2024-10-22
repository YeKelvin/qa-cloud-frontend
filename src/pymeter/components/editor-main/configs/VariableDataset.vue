<template>
  <div class="pymeter-component-container" style="padding-bottom: 40px">
    <!-- 变量集名称和操作按钮 -->
    <div class="header-container">
      <!-- 搜索 -->
      <span style="display: inline-flex; flex: 1">
        <el-input v-model="filteredText" placeholder="搜索变量" clearable />
      </span>
    </div>

    <!-- 变量表格 -->
    <el-table ref="eltableRef" :data="filteredData" style="margin-bottom: 20px" fit stripe highlight-current-row>
      <!-- 数据为空时显示添加按钮 -->
      <template #empty><el-empty /></template>

      <!-- 是否启用 -->
      <el-table-column label="启用" align="center" width="80" min-width="80">
        <template #default="{ row, $index }">
          <el-switch
            v-show="isEmpty(filteredText) && configData.variableList.length != $index + 1"
            v-model="row.enabled"
            size="small"
            inline-prompt
            :active-icon="Check"
            :inactive-icon="Close"
          />
        </template>
      </el-table-column>

      <!-- 变量名称 -->
      <el-table-column label="变量名称">
        <template #default="{ row }">
          <AutosizeTextarea v-model="row.variableName" />
        </template>
      </el-table-column>

      <!-- 默认值 -->
      <el-table-column label="默认值">
        <template #default="{ row }">
          <AutosizeTextarea v-model="row.initialValue" />
        </template>
      </el-table-column>

      <!-- 当前值 -->
      <el-table-column label="当前值">
        <template #default="{ row }">
          <AutosizeTextarea v-model="row.currentValue" />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" fixed="right" align="center" width="60" min-width="60">
        <template #default="{ row, $index }">
          <!-- 删除按钮 -->
          <el-button
            v-show="isEmpty(filteredText) && configData.variableList.length != $index + 1"
            type="danger"
            link
            :icon="Delete"
            @click="removeVariable(row, $index)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 操作按钮 -->
    <template v-if="unsaved">
      <SaveButton :tips="shortcutKeyName" @click="save()" />
    </template>
  </div>
</template>

<script setup>
import { Check, Close, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce, has, isEmpty } from 'lodash-es'

import * as VariablesService from '@/api/script/variables'
import AutosizeTextarea from '@/components/autosize-textarea/AutosizeTextarea.vue'
import SaveButton from '@/pymeter/components/editor-main/others/SaveButton.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import { usePyMeterDB } from '@/store/pymeter-db'
import { toHashCode } from '@/utils/object-util'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const { assignConfig, assignMetadata } = useElement()
const { unsaved, metadata, localkey, shortcutKeyName } = useEditor()
const offlineDB = usePyMeterDB().offlineDB
const configData = ref({
  datasetNo: props.metadata.sn,
  variableList: [],
  deletionList: []
})
const eltableRef = ref()
const filteredText = ref('')
const filteredData = computed(() => {
  const filterKey = filteredText.value
  if (isEmpty(filterKey)) return configData.value.variableList
  return configData.value.variableList.filter(
    item =>
      (item.variableName && item.variableName.includes(filterKey.trim())) ||
      (item.initialValue && item.initialValue.includes(filterKey.trim())) ||
      (item.currentValue && item.currentValue.includes(filterKey.trim()))
  )
})

watch(
  configData,
  debounce(localdata => {
    // 底部自动新加一行
    autoNewRow()
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
  } else {
    // 查询后端数据
    queryBackendData()
  }
})

/**
 * 查询离线数据
 */
const queryOfflineData = async () => {
  const offline = await offlineDB.getItem(localkey.value)
  assignConfig(configData.value, offline.data)
  assignMetadata(metadata.value, offline.meta)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  const response = await VariablesService.queryVariablesByDataset({ datasetNo: configData.value.datasetNo })
  const backendData = response.data
  backendData.push({ variableName: '', variableDesc: '', initialValue: '', currentValue: '', enabled: true })
  configData.value.variableList = backendData
  configData.value.deletionList = []
  assignMetadata(metadata.value, { hashcode: toHashCode(configData.value) })
}

/**
 * 最后一行不为空时，自动添加一行
 */
const autoNewRow = () => {
  const variableList = configData.value.variableList
  if (isEmpty(variableList)) {
    newRow()
  } else {
    const lastRow = variableList.at(-1)
    if (!isBlankRow(lastRow)) newRow()
  }
}

/**
 * 新增一行
 */
const newRow = () => {
  configData.value.variableList.push({
    variableName: '',
    variableDesc: '',
    initialValue: '',
    currentValue: '',
    enabled: true
  })
}

/**
 * 判断是否为空行
 */
const isBlankRow = row => {
  return isEmpty(row.variableName) && isEmpty(row.initialValue) && isEmpty(row.currentValue)
}

/**
 * 删除变量
 */
const removeVariable = (row, index) => {
  if (has(row, 'variableNo')) {
    // 存在 variableNo 时，添加至待删除列表中，等待提交时调用批量删除变量接口
    configData.value.deletionList.push(row)
    configData.value.variableList.splice(index, 1)
  } else {
    // 没有 variableNo 时，代表数据库中没有该变量，直接移出提交列表
    configData.value.variableList.splice(index, 1)
  }
}

/**
 * 删除变量二次确认
 */
const comfirmDeleteVariables = async (...args) => {
  const msgList = [h('p', null, '是否确定删除以下变量?')]
  for (const item of args) msgList.push(h('p', null, h('b', null, item)))
  return await ElMessageBox.confirm(null, {
    type: 'error',
    title: '警告',
    message: h('div', null, msgList),
    confirmButtonText: '确 定',
    cancelButtonText: '取 消'
  })
    .then(() => false)
    .catch(() => true)
}

/**
 * 提交数据
 */
const save = async () => {
  // 手动清空的空行如果存在 variableNo 则加入待删除列表
  for (const row of configData.value.variableList.filter(row => isBlankRow(row)))
    has(row, 'variableNo') && configData.value.deletionList.push(row)

  // 删除变量
  if (!isEmpty(configData.value.deletionList)) {
    // 二次确认
    const cancelled = await comfirmDeleteVariables(...configData.value.deletionList.map(item => item.variableName))
    if (cancelled) return
    // 提交删除
    await VariablesService.deleteVariables({
      datasetNo: configData.value.datasetNo,
      variables: configData.value.deletionList.map(item => item.variableNo)
    })
    // 清空待删除列表
    configData.value.deletionList = []
  }

  // 过滤空行
  const vars = configData.value.variableList.filter(row => !isBlankRow(row))
  // 提交修改
  !isEmpty(vars) &&
    (await VariablesService.modifyVariables({ datasetNo: configData.value.datasetNo, variableList: vars }))
  // 标记数据已保存
  unsaved.value = false
  // 更新HashCode
  metadata.value.hashcode = toHashCode(configData.value)
  // 移除离线数据
  offlineDB.removeItem(localkey.value)
  // 重新查询变量
  queryBackendData()
  // 成功提示
  ElMessage({ message: '保存成功', type: 'info', duration: 2 * 1000 })
}

defineExpose({
  save
})
</script>

<style lang="scss" scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 15px;
  margin-bottom: 10px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

:deep(.el-empty__description) {
  display: none;
}

:deep(.el-table__inner-wrapper::before) {
  height: 0;
}
</style>

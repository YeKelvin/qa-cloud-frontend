<template>
  <div id="dataset-dialog">
    <el-dialog width="60%" :show-close="false" center v-bind="$attrs" @close="$emit('update:model-value', false)">
      <!-- 顶栏 -->
      <template #header>
        <div v-show="!isEmpty(selectedDatasetList)" style="display: flex">
          <el-tabs v-model="activeTabNo" type="card" style="flex-grow: 1">
            <el-tab-pane
              v-for="item in selectedDatasetList"
              :key="item.datasetNo"
              :label="item.datasetName"
              :name="item.datasetNo"
            />
          </el-tabs>
        </div>
      </template>

      <!-- 筛选输入框 -->
      <el-input v-model="filteredText" style="padding: 10px" placeholder="搜索变量" clearable />
      <!-- 滚动条 -->
      <el-scrollbar
        id="variables-view__scrollbar"
        style="width: 100%; max-height: 600px"
        wrap-style="overflow-x:auto;"
        view-style="padding: 0 10px 10px 10px;"
      >
        <!-- 变量表格 -->
        <el-table :data="filteredData" fit border stripe highlight-current-row>
          <!-- 空表格 -->
          <template #empty><el-empty /></template>

          <!-- 变量名称 -->
          <el-table-column label="变量名称" width="auto">
            <template #default="{ row }">
              <div
                class="variable-item-wrapper"
                @dblclick="copy(row.variableName, { close: true })"
                @mouseenter="row.hoverName = true"
                @mouseleave="row.hoverName = false"
              >
                <span>{{ row.variableName }}</span>
                <el-button
                  v-show="row.hoverName"
                  type="primary"
                  link
                  :icon="CopyDocument"
                  @click="copy(row.variableName, { close: true })"
                />
              </div>
            </template>
          </el-table-column>

          <!-- 默认值 -->
          <el-table-column label="默认值" width="auto">
            <template #default="{ row }">
              <div
                class="variable-item-wrapper"
                @dblclick="copy(row.initialValue)"
                @mouseenter="row.initValHovered = true"
                @mouseleave="row.initValHovered = false"
              >
                <span>{{ row.initialValue || '-' }}</span>
                <el-button
                  v-show="row.initValHovered"
                  type="primary"
                  link
                  :icon="CopyDocument"
                  @click="copy(row.initialValue)"
                />
              </div>
            </template>
          </el-table-column>

          <!-- 当前值 -->
          <el-table-column label="当前值" width="auto">
            <template #default="{ row }">
              <div
                class="variable-item-wrapper"
                @dblclick="copy(row.currentValue)"
                @mouseenter="row.currValHovered = true"
                @mouseleave="row.currValHovered = false"
              >
                <span>{{ row.currentValue || '-' }}</span>
                <el-button
                  v-show="row.currValHovered"
                  type="primary"
                  link
                  :icon="CopyDocument"
                  @click="copy(row.currentValue)"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
      <!-- 编辑按钮 -->
      <div class="flexbox-center">
        <el-button type="primary" plain :icon="Edit" @click="openDatasetEditor()">批量编辑</el-button>
      </div>
      <!-- 回到顶部按钮 -->
      <el-backtop
        target="#variables-view__scrollbar .el-scrollbar__wrap"
        :right="backtop.right"
        :bottom="backtop.bottom"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { CopyDocument, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isEmpty } from 'lodash-es'

import * as VariablesService from '@/api/script/variables'
import useClipboard from '@/composables/useClipboard'
import useDataset from '@/pymeter/composables/useDataset'
import { usePyMeterStore } from '@/store/pymeter'
import { usePyMeterDB } from '@/store/pymeter-db'

const { datasetList } = useDataset()
const { toClipboard } = useClipboard()
const pymeterStore = usePyMeterStore()
const offlineDB = usePyMeterDB().offlineDB

const emit = defineEmits(['update:model-value'])
const rows = ref([])
const activeTabNo = ref('')
const cellInputRef = ref()

const filteredText = ref('')
const filteredData = computed(() => {
  const text = filteredText.value.trim()
  if (isEmpty(text)) {
    return rows.value
  } else {
    return rows.value.filter(
      (item) =>
        (item.variableName && item.variableName.indexOf(text) !== -1) ||
        (item.initialValue && item.initialValue.indexOf(text) !== -1) ||
        (item.currentValue && item.currentValue.indexOf(text) !== -1)
    )
  }
})
const selectedDatasetList = computed(() =>
  datasetList.value.filter((item) => pymeterStore.selectedDatasets.indexOf(item.datasetNo) > -1)
)
const backtop = reactive({
  right: 40,
  bottom: 40
})

watch(cellInputRef, (input) => {
  if (!input) return
  input.focus()
})

watch(activeTabNo, () => {
  queryVariables()
})

onMounted(() => {
  // 激活第一个 tab 页，并触发wacth，查询变量集
  if (!isEmpty(pymeterStore.selectedDatasets)) {
    activeTabNo.value = pymeterStore.selectedDatasets[0]
  }
  // 计算 backtop 位置
  nextTick(() => {
    const dialog = document.querySelector('#dataset-dialog').querySelector('.el-dialog')
    backtop.right = (document.body.clientWidth - dialog.clientWidth) / 2 + 20
    backtop.bottom = document.body.clientHeight - dialog.offsetTop - 40 - 600 - 40
  })
})

const copy = async (val, options = { close: false }) => {
  await toClipboard(val)
  if (options.close) closeDialog()
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

const closeDialog = () => {
  emit('update:model-value', false)
}

/**
 * 判断是否为空行
 */
const isBlankRow = (row) => {
  return isEmpty(row.variableName) && isEmpty(row.initialValue) && isEmpty(row.currentValue)
}

/**
 * 查询变量集下的所有变量
 */
const queryVariables = async () => {
  if (isEmpty(pymeterStore.selectedDatasets) || isEmpty(activeTabNo.value)) return
  // 查询离线数据
  const offline = await offlineDB.getItem(activeTabNo.value)
  if (offline) {
    rows.value = offline.data.variableList.filter((row) => !isBlankRow(row))
  } else {
    // 查询后端数据
    const response = await VariablesService.queryVariablesByDataset({ datasetNo: activeTabNo.value })
    rows.value = response.data
  }
}

/**
 * 打开变量集组件
 */
const openDatasetEditor = () => {
  const dataset = datasetList.value.find((item) => item.datasetNo === activeTabNo.value)
  if (!dataset) return

  emit('update:model-value', false)
  pymeterStore.addTab({
    editorNo: dataset.datasetNo,
    editorName: dataset.datasetName,
    editorComponent: 'VariableDataset',
    editorMode: 'QUERY',
    metadata: {
      sn: dataset.datasetNo,
      name: dataset.datasetName,
      component: 'VariableDataset'
    }
  })
}
</script>

<style lang="scss" scoped>
.variable-item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-value-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.el-dialog__header) {
  padding: 0;
  margin-right: 0;

  .el-tabs__header {
    margin: 0;
  }

  .el-button--text {
    height: 40px;
    padding: 0 20px;
    border-bottom: 1px solid #e4e7ed;
  }
}

:deep(.el-tabs__nav) {
  border-top: 0 !important;
  border-radius: 0 !important;
}

:deep(.el-tabs__content) {
  display: none;
}

:deep(.el-dialog) {
  padding: 0;
}

:deep(.el-dialog__body) {
  padding-bottom: 10px;
}

:deep(.el-table td, .el-table th) {
  padding: 2px;
}

:deep(.el-empty__description) {
  display: none;
}

#current-value-button {
  .el-button--text {
    height: 30px;
    padding: 0;
  }
}
</style>

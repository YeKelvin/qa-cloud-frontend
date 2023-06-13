<template>
  <div id="topbar-variables-dialog">
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
          <el-button
            style="border-bottom: var(--el-border); border-radius: 0; padding-right: 10px"
            type="primary"
            link
            :icon="Edit"
            @click="openVariableDatasetEditor()"
          >
            批量编辑
          </el-button>
        </div>
      </template>

      <el-input v-model="filterText" style="padding: 10px" placeholder="搜索变量" clearable />

      <!-- 滚动条 -->
      <el-scrollbar
        id="variables-view__scrollbar"
        style="width: 100%; max-height: 600px"
        wrap-style="overflow-x:auto;"
        view-style="padding: 0 10px 10px 10px;"
      >
        <!-- 变量表格 -->
        <el-table :data="filterTableData" border fit stripe highlight-current-row>
          <!-- 空表格 -->
          <template #empty><el-empty /></template>

          <!-- 变量名称 -->
          <el-table-column label="变量名称" width="auto">
            <template #default="{ row }">
              <div class="variable-name-wrapper" @dblclick="copy(row.varName)">
                <span>{{ row.varName }}</span>
                <el-button type="primary" link :icon="CopyDocument" @click="copy(row.varName)" />
              </div>
            </template>
          </el-table-column>

          <!-- 默认值 -->
          <el-table-column label="默认值" width="auto">
            <template #default="{ row }">
              <span>{{ row.initialValue }}</span>
            </template>
          </el-table-column>

          <!-- 当前值 -->
          <el-table-column label="当前值" width="auto">
            <!-- 表头 -->
            <template #header="{}">
              <span class="current-value-header">
                <span>当前值</span>
                <el-switch
                  v-model="pymeterStore.useCurrentValue"
                  size="small"
                  inline-prompt
                  :active-icon="Check"
                  :inactive-icon="Close"
                />
              </span>
            </template>
            <!-- 单元格 -->
            <template #default="{ row }">
              <span v-if="row.editing" class="current-value__editing">
                <el-input v-model="row.currentValue" autosize type="textarea" size="small" :rows="1" />
                <span id="current-value-button" style="display: flex; justify-content: flex-end">
                  <el-button type="danger" link :icon="Check" @click="updateCurrentValue(row)" />
                  <el-button type="primary" link :icon="Close" @click="row.editing = false" />
                </span>
              </span>
              <span v-else class="current-value-wrapper" @dblclick="row.editing = true">
                <span>{{ row.currentValue }}</span>
                <el-button type="primary" link :icon="Edit" @click="row.editing = true" />
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
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
import * as VariablesService from '@/api/script/variables'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit, CopyDocument } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import { isBlank } from '@/utils/string-util'
import { usePyMeterStore } from '@/store/pymeter'
import useClipboard from '@/composables/useClipboard'

const { toClipboard } = useClipboard()
const emit = defineEmits(['update:model-value'])
const pymeterStore = usePyMeterStore()
const activeTabNo = ref('')
const rows = ref([])
const backtop = reactive({
  right: 40,
  bottom: 40
})
const filterText = ref('')
const filterTableData = computed(() => {
  if (isBlank(filterText.value)) {
    return rows.value
  } else {
    const text = filterText.value.trim()
    return rows.value.filter(
      (item) =>
        (item.varName && item.varName.indexOf(text) !== -1) ||
        (item.initialValue && item.initialValue.indexOf(text) !== -1) ||
        (item.currentValue && item.currentValue.indexOf(text) !== -1)
    )
  }
})
const selectedDatasetList = computed(() =>
  pymeterStore.datasetList.filter((item) => pymeterStore.selectedDatasets.indexOf(item.datasetNo) > -1)
)

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
    const dialog = document.querySelector('#topbar-variables-dialog').querySelector('.el-dialog')
    backtop.right = (document.body.clientWidth - dialog.clientWidth) / 2 + 20
    backtop.bottom = document.body.clientHeight - dialog.offsetTop - 40 - 600 - 40
  })
})

const copy = async (val) => {
  await toClipboard(val)
  closeDialog()
  ElMessage({ message: '复制成功', type: 'success', duration: 1 * 1000 })
}

const closeDialog = () => {
  emit('update:model-value', false)
}

/**
 * 查询变量集下的所有变量
 */
const queryVariables = () => {
  if (isEmpty(pymeterStore.selectedDatasets) || activeTabNo.value === '') return
  VariablesService.queryVariablesByDataset({ datasetNo: activeTabNo.value }).then((response) => {
    rows.value = response.result
  })
}

/**
 * 更新变量的当前值
 */
const updateCurrentValue = (row) => {
  if (row.currentValue === row.cache.currentValue) {
    row.editing = false
    return
  }
  VariablesService.updateCurrentValue({ varNo: row.varNo, value: row.currentValue }).then(() => {
    queryVariables()
  })
}

/**
 * 打开变量集组件
 */
const openVariableDatasetEditor = () => {
  const dataset = pymeterStore.datasetList.find((item) => item.datasetNo === activeTabNo.value)
  if (!dataset) return

  emit('update:model-value', false)
  pymeterStore.addTab({
    editorNo: dataset.datasetNo,
    editorName: dataset.datasetName,
    editorComponent: 'VariableDataset',
    editorMode: 'QUERY',
    metadata: {
      datasetName: dataset.datasetName,
      datasetType: dataset.datasetType,
      datasetDesc: dataset.datasetDesc
    }
  })
}
</script>

<style lang="scss" scoped>
.variable-name-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-value-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-value-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-value__editing {
  display: flex;
  flex-direction: column;
  padding-top: 10px;
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

:deep(.el-dialog__body) {
  padding: 0;
  padding-bottom: 20px;
}

:deep(.el-table td, .el-table th) {
  padding: 2px;
}

/* :deep(.el-table__inner-wrapper::before) {
  height: 0;
} */

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

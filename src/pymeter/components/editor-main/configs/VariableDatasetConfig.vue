<template>
  <div class="pymeter-component-container" style="padding-bottom: 40px">
    <!-- 变量集名称和操作按钮 -->
    <div class="header-container">
      <!-- 搜索 -->
      <span style="display: inline-flex; flex: 1">
        <el-input v-show="queryMode" v-model="filterText" placeholder="搜索变量" clearable />
      </span>
    </div>

    <!-- 变量表格 -->
    <el-table ref="eltableRef" :data="filterTableData" fit stripe highlight-current-row>
      <!-- 数据为空时显示添加按钮 -->
      <template #empty><el-empty /></template>

      <!-- 是否启用 -->
      <el-table-column v-if="queryMode" label="启用" align="center" width="60" min-width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" @click.prevent="modifyVariableState(row)" />
        </template>
      </el-table-column>

      <!-- 变量名称 -->
      <el-table-column label="变量名称">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode || row.editing" v-model="row.varName" />
          <span v-else>{{ row.varName }}</span>
        </template>
      </el-table-column>

      <!-- 默认值 -->
      <el-table-column label="默认值">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode || row.editing" v-model="row.initialValue" />
          <span v-else>{{ row.initialValue }}</span>
        </template>
      </el-table-column>

      <!-- 当前值 -->
      <el-table-column label="当前值">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode || row.editing" v-model="row.currentValue" />
          <span v-else>{{ row.currentValue }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column fixed="right" align="center" width="80" min-width="80">
        <!-- 操作列表头，新增变量按钮 -->
        <template #header>
          <el-button v-show="queryMode" type="primary" link :icon="Plus" @click="newRowAndScroll()">添加</el-button>
        </template>
        <!-- 操作按钮 -->
        <template #default="{ row, $index }">
          <!-- 编辑或新增模式下可用的按钮 -->
          <!-- 删除变量按钮 -->
          <el-button v-if="!queryMode" type="primary" link :icon="Close" @click="cancelVariable(row, $index)" />
          <!-- 查询模式下可用的按钮 -->
          <template v-if="queryMode">
            <template v-if="row.editing">
              <!-- 单行提交按钮 -->
              <el-button type="danger" link :icon="Check" @click="submitVariable(row)" />
              <!-- 单行取消按钮 -->
              <el-button type="primary" link :icon="Close" @click="queryVariables()" />
            </template>
            <template v-else>
              <!-- 单行编辑按钮 -->
              <el-button type="primary" link :icon="Edit" @click="row.editing = true" />
              <!-- 删除变量按钮 -->
              <el-button type="primary" link :icon="Delete" @click="removeVariable(row)" />
            </template>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="queryMode && !isEmpty(rows)" style="padding: 10px 20px">
      <el-button type="primary" link :icon="Plus" @click="newEditingRow">添加</el-button>
    </div>

    <!-- 底部操作按钮 -->
    <div style="display: flex; justify-content: center; margin-top: 20px">
      <template v-if="queryMode">
        <el-button type="primary" :icon="Edit" @click="batchEditNow()">批量编辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </template>
      <template v-else>
        <el-button type="danger" :icon="Check" @click="saveVariables()">保 存</el-button>
        <el-button :icon="Close" @click="cancelEdit()">取 消</el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import * as VariablesService from '@/api/script/variables'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Delete, Edit, Plus } from '@element-plus/icons-vue'
import { isEmpty, has } from 'lodash-es'
import { isBlank, isBlankAll, isNotBlank } from '@/utils/string-util'
import { usePyMeterStore } from '@/store/pymeter'
import useEditor from '@/pymeter/composables/useEditor'
import EditorProps from '@/pymeter/composables/editor.props'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'

const pymeterStore = usePyMeterStore()
const props = defineProps(EditorProps)
const { queryMode, createMode, functions, editNow, setReadonly, closeTab } = useEditor(props)
const eltableRef = ref()
const datasetNo = ref(props.editorNo)
const rows = ref([])
const pendingDeletionList = ref([])
const filterText = ref('')
const filterTableData = computed(() => {
  const filterKey = filterText.value
  if (isBlank(filterKey)) {
    return rows.value
  } else {
    return rows.value.filter(
      (item) =>
        (item.varName && item.varName.indexOf(filterKey.trim()) !== -1) ||
        (item.initialValue && item.initialValue.indexOf(filterKey.trim()) !== -1) ||
        (item.currentValue && item.currentValue.indexOf(filterKey.trim()) !== -1)
    )
  }
})

watch(queryMode, () => {
  // 动态显隐表格列后重新渲染表格
  nextTick(() => {
    eltableRef.value.doLayout()
  })
  // 表格没有数据时自动添加一行
  autoNewRow()
})

watch(rows, () => autoNewRow(), { deep: true })

onMounted(() => {
  if (createMode.value) {
    newRow()
  } else {
    // 查询或编辑模式时，先拉取变量信息
    queryVariables()
  }
})

/**
 * 切换为批量编辑模式
 */
const batchEditNow = () => {
  filterText.value = ''
  editNow()
}

/**
 * 最后一行不为空时，自动添加一行
 */
const autoNewRow = () => {
  if (queryMode.value) return
  if (isEmpty(rows.value)) {
    newRow()
  } else {
    const lastRow = rows.value[rows.value.length - 1]
    if (!isBlankRow(lastRow)) newRow()
  }
}

/**
 * 查询变量集下的所有变量
 */
const queryVariables = () => {
  VariablesService.queryVariablesByDataset({ datasetNo: datasetNo.value }).then((response) => {
    rows.value = response.result
    pendingDeletionList.value = []
  })
}

/**
 * 新增一行
 */
const newRow = () => {
  rows.value.push({ varName: '', varDesc: '', initialValue: '', currentValue: '', enabled: true })
}

const newEditingRow = () => {
  rows.value.push({ varName: '', varDesc: '', initialValue: '', currentValue: '', enabled: true, editing: true })
}

/**
 * 新增一行并滚动至底部
 */
const newRowAndScroll = () => {
  rows.value.push({ varName: '', varDesc: '', initialValue: '', currentValue: '', enabled: true, editing: true })
  scrollToBottom()
}

/**
 * 判断是否为空行
 */
const isBlankRow = (row) => {
  return isBlankAll(row.varName, row.varDesc, row.initialValue, row.currentValue)
}

/**
 * 滚动至底部
 */
const scrollToBottom = () => {
  const scrollbar = document.querySelector('#editor-main-scrollbar > .el-scrollbar__wrap')
  scrollbar.scrollTop = scrollbar.scrollHeight
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
  queryVariables()
  setReadonly()
}

/**
 * 根据索引号删除行
 */
const cancelVariable = (row, index) => {
  if (has(row, 'varNo')) {
    // 存在 varNo 时，添加至待删除列表中，等待提交时调用批量删除变量接口
    pendingDeletionList.value.push(row)
    rows.value.splice(index, 1)
  } else {
    // 没有 varNo 时，代表数据库中没有该变量，直接移出提交列表
    rows.value.splice(index, 1)
  }
}

/**
 * 新增或修改单个变量
 */
const submitVariable = (row) => {
  if (isBlank(row.varName)) {
    ElMessage({ message: '变量不允许为空', type: 'error', duration: 2 * 1000 })
    return
  }

  if (isNotBlank(row.varNo)) {
    // 修改变量
    VariablesService.modifyVariable({
      varNo: row.varNo,
      varName: row.varName,
      varDesc: row.varDesc,
      initialValue: row.initialValue,
      currentValue: row.currentValue
    }).then(() => {
      ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
      queryVariables()
    })
  } else {
    // 新增变量
    VariablesService.createVariable({
      datasetNo: datasetNo.value,
      varName: row.varName,
      varDesc: row.varDesc,
      initialValue: row.initialValue,
      currentValue: row.currentValue
    }).then(() => {
      // 成功提示
      ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
      // 重新查询变量
      queryVariables()
    })
  }
}

/**
 * 根据索引号删除行
 */
const removeVariable = async (row) => {
  // 二次确认
  const cancelled = await popupDeletionComfirm(row.varName)
  if (cancelled) return
  // 删除变量
  await VariablesService.deleteVariable({ varNo: row.varNo })
  // 删除变量所在行数据
  const index = rows.value.findIndex((item) => item.varName === row.varName)
  rows.value.splice(index, 1)
}

/**
 * 修改变量启用状态
 */
const modifyVariableState = (row) => {
  // 切换变量状态
  row.enabled = !row.enabled
  // 调用接口变更变量状态
  if (row.enabled) {
    VariablesService.enableVariable({ varNo: row.varNo })
  } else {
    VariablesService.disableVariable({ varNo: row.varNo })
  }
}

const popupDeletionComfirm = async (...args) => {
  const msgList = [h('p', null, '确定删除以下变量吗？')]
  args.forEach((item) => msgList.push(h('p', null, item)))
  return await ElMessageBox.confirm(null, {
    title: '警告',
    message: h('div', null, msgList),
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  })
    .then(() => false)
    .catch(() => true)
}

/**
 * 保存批量编辑
 */
const saveVariables = async () => {
  // 手动清空的空行如果存在 varNo 则加入待删除列表
  rows.value
    .filter((row) => isBlankRow(row))
    .forEach((row) => {
      if (has(row, 'varNo')) {
        pendingDeletionList.value.push(row)
      }
    })

  // 批量删除变量
  if (!isEmpty(pendingDeletionList.value)) {
    // 二次确认
    const cancelled = await popupDeletionComfirm(...pendingDeletionList.value.map((item) => item.varName))
    if (cancelled) return
    await VariablesService.deleteVariables({
      datasetNo: datasetNo.value,
      variables: pendingDeletionList.value.map((item) => item.varNo)
    })
  }

  // 批量更新变量
  const vars = rows.value.filter((row) => !isBlankRow(row))
  if (!isEmpty(vars)) {
    await VariablesService.modifyVariables({
      datasetNo: datasetNo.value,
      variableList: vars
    })
  }

  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 重新查询变量
  queryVariables()
  // 切换为只读模式
  setReadonly()
  // 重新查询列表
  pymeterStore.queryDatasetAll()
}

// 暂存函数，给 useEditor 使用
functions.createFn = saveVariables
functions.modifyFn = saveVariables
</script>

<style lang="scss" scoped>
span {
  white-space: pre-wrap;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

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

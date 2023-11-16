<template>
  <div class="pymeter-component-container" style="padding-bottom: 40px">
    <!-- 模板名称和操作按钮 -->
    <div class="header-container">
      <!-- 搜索 -->
      <span style="display: inline-flex; flex: 1">
        <el-input v-model="filteredText" placeholder="搜索请求头" clearable />
      </span>
    </div>

    <!-- 请求头表格 -->
    <el-table ref="eltableRef" :data="filteredData" style="margin-bottom: 20px" fit stripe highlight-current-row>
      <!-- 数据为空时显示添加按钮 -->
      <template #empty><el-empty /></template>

      <!-- 是否启用 -->
      <el-table-column label="启用" align="center" width="80" min-width="80">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" size="small" :active-icon="Check" :inactive-icon="Close" inline-prompt />
        </template>
      </el-table-column>

      <!-- 请求头名称 -->
      <el-table-column label="请求头名称">
        <template #default="{ row }">
          <SimpleTextarea v-model="row.headerName" />
        </template>
      </el-table-column>

      <!-- 请求头的值 -->
      <el-table-column label="请求头内容">
        <template #default="{ row }">
          <SimpleTextarea v-model="row.headerValue" />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" fixed="right" align="center" width="80" min-width="80">
        <template #default="{ row, $index }">
          <!-- 删除请求头按钮 -->
          <el-button type="primary" link :icon="Delete" @click="removeHeader(row, $index)" />
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
import * as HttpHeaderService from '@/api/script/headers'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'
import SaveButton from '@/pymeter/components/editor-main/common/SaveButton.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import { usePyMeterDB } from '@/store/pymeter-db'
import { toHashCode } from '@/utils/object-util'
import { Check, Close, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { has, isEmpty, debounce } from 'lodash-es'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const { assignElement, assignMetadata } = useElement()
const { unsaved, metadata, localkey, shortcutKeyName } = useEditor()
const offlineDB = usePyMeterDB().offlineDB
const configData = ref({
  templateNo: props.metadata.sn,
  headerList: [],
  deletionList: []
})
const eltableRef = ref()
const filteredText = ref('')
const filteredData = computed(() => {
  const filterKey = filteredText.value
  if (isEmpty(filterKey)) return configData.value.headerList
  return configData.value.headerList.filter(
    (item) =>
      (item.headerName && item.headerName.indexOf(filterKey.trim()) !== -1) ||
      (item.headerValue && item.headerValue.indexOf(filterKey.trim()) !== -1)
  )
})

watch(
  configData,
  debounce((localdata) => {
    console.log('watch')
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
    console.log('存离线')
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
  assignElement(configData.value, offline.data)
  assignMetadata(metadata.value, offline.meta)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  const response = await HttpHeaderService.queryHttpHeadersByTemplate({ templateNo: configData.value.templateNo })
  const backendData = response.result
  backendData.push({ headerName: '', headerDesc: '', headerValue: '', enabled: true })
  configData.value.headerList = backendData
  configData.value.deletionList = []
  assignMetadata(metadata.value, { hashcode: toHashCode(configData.value) })
}

/**
 * 最后一行不为空时，自动添加一行
 */
const autoNewRow = () => {
  const headerList = configData.value.headerList
  if (isEmpty(headerList)) {
    newRow()
  } else {
    const lastRow = headerList[headerList.length - 1]
    if (!isBlankRow(lastRow)) newRow()
  }
}

/**
 * 新增一行空行
 */
const newRow = () => {
  configData.value.headerList.push({ headerName: '', headerDesc: '', headerValue: '', enabled: true })
}

/**
 * 判断是否为空行
 */
const isBlankRow = (row) => {
  return isEmpty(row.headerName) && isEmpty(row.headerValue)
}

/**
 * 删除请求头
 */
const removeHeader = (row, index) => {
  if (has(row, 'headerNo')) {
    // 存在 headerNo 时，添加至待删除列表中，等待提交时调用批量删除请求头接口
    configData.value.deletionList.push(row)
    configData.value.headerList.splice(index, 1)
  } else {
    // 没有 headerNo 时，代表数据库中没有该请求头，直接移出提交列表
    configData.value.headerList.splice(index, 1)
  }
}

/**
 * 删除变量二次确认
 */
const comfirmDeleteHeaders = async (...args) => {
  const msgList = [h('p', null, '是否确定删除以下请求头?')]
  args.forEach((item) => msgList.push(h('p', null, h('b', null, item))))
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
 * 提交数据
 */
const save = async () => {
  // 手动清空的空行如果存在 headerNo 则加入待删除列表
  configData.value.headerList
    .filter((row) => isBlankRow(row))
    .forEach((row) => has(row, 'headerNo') && configData.value.deletionList.push(row))

  // 批量删除变量
  if (!isEmpty(configData.value.deletionList)) {
    // 二次确认
    const cancelled = await comfirmDeleteHeaders(...configData.value.deletionList.map((item) => item.headerName))
    if (cancelled) return
    // 提交删除
    await HttpHeaderService.deleteHttpHeaders({
      templateNo: configData.value.templateNo,
      headers: configData.value.deletionList.map((item) => item.headerNo)
    })
    // 清空待删除列表
    configData.value.deletionList = []
  }

  // 过滤空行
  const headers = configData.value.headerList.filter((row) => !isBlankRow(row))
  // 提交修改
  !isEmpty(headers) &&
    (await HttpHeaderService.modifyHttpHeaders({ templateNo: configData.value.templateNo, headerList: headers }))
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

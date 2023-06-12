<template>
  <el-card shadow="hover" style="margin: 10px 0" :body-style="{ padding: '10px' }">
    <template #header><span>自定义</span></template>
    <el-table stripe style="width: 100%; margin-bottom: 10px" :data="rows">
      <!-- 空表格 -->
      <template #empty>
        <el-empty :image-size="80" />
      </template>

      <!-- 是否启用 -->
      <el-table-column label="启用" align="center" width="60" min-width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" :disabled="queryMode" />
        </template>
      </el-table-column>

      <!-- header名称 -->
      <el-table-column label="请求头名称" width="auto">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode" v-model="row.name" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>

      <!-- header值 -->
      <el-table-column label="请求头内容" width="auto">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode" v-model="row.value" />
          <span v-else>{{ row.value }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column fixed="right" align="center" width="50" min-width="10">
        <template #header>
          <el-button v-show="!queryMode" type="primary" link :icon="Plus" @click="newRow()" />
        </template>
        <template #default="{ $index }">
          <el-button type="primary" link :icon="Delete" :disabled="queryMode" @click="delRow($index)" />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { isBlankAll } from '@/utils/string-util'
import { Delete, Plus } from '@element-plus/icons-vue'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'

const emit = defineEmits(['update:data'])
const props = defineProps({
  data: { type: Array, required: true },
  editMode: { type: String, default: 'QUERY' }
})

const queryMode = computed(() => props.editMode === 'QUERY')
const rows = computed({
  get() {
    return props.data
  },
  set(val) {
    emit('update:data', val)
  }
})

// 表格没有数据时自动添加一行
watch(queryMode, () => autoNewRow())
watch(rows, () => autoNewRow(), { deep: true })
onMounted(() => autoNewRow())

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

const newRow = () => {
  rows.value.push({ enabled: true, name: '', value: '' })
}
const delRow = (index) => {
  rows.value.splice(index, 1)
}
const isBlankRow = (row) => {
  return isBlankAll(row.name, row.value)
}
</script>

<script>
export default {
  inheritAttrs: false
}
</script>

<style lang="scss" scoped>
.el-empty {
  padding: 0;
  padding-top: 20px;
}

.el-table {
  &::before {
    height: 0;
  }
}

span {
  white-space: pre-wrap;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
}

:deep(.el-card__header) {
  user-select: none;
  padding: 5px 10px;
}

:deep(.el-table__inner-wrapper::before) {
  height: 0;
}

:deep(.el-empty__description) {
  display: none;
}
</style>

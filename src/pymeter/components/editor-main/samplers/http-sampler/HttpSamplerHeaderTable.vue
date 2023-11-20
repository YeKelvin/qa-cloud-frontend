<template>
  <el-card shadow="hover" style="margin: 10px 0" :body-style="{ padding: '10px' }">
    <template #header><span>自定义</span></template>
    <el-table ref="eltableRef" :data="rows" style="width: 100%; margin-bottom: 10px" stripe>
      <!-- 空表格 -->
      <template #empty>
        <el-empty :image-size="80" />
      </template>

      <!-- 排序图标 -->
      <el-table-column align="center" width="40" min-width="40">
        <template #default="{ $index }">
          <SvgIcon v-show="rows.length != $index + 1" icon-name="pymeter-move" class="sorted-handle" />
        </template>
      </el-table-column>

      <!-- 是否启用 -->
      <el-table-column align="center" width="50" min-width="50">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" size="large" />
        </template>
      </el-table-column>

      <!-- header名称 -->
      <el-table-column label="请求头名称" width="auto">
        <template #default="{ row }">
          <SimpleTextarea v-model="row.name" />
        </template>
      </el-table-column>

      <!-- header值 -->
      <el-table-column label="请求头内容" width="auto">
        <template #default="{ row }">
          <SimpleTextarea v-model="row.value" />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" fixed="right" width="60" min-width="60">
        <template #default="{ $index }">
          <!-- 删除按钮 -->
          <el-button v-show="rows.length != $index + 1" type="danger" link :icon="Delete" @click="delRow($index)" />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'
import { Delete } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import sortablejs from 'sortablejs'

let sortable = null

const props = defineProps({ modelValue: Array })
const emit = defineEmits(['update:modelValue'])
const rows = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const eltableRef = ref()

// 表格没有数据时自动添加一行
watch(rows, () => autoNewRow(), { deep: true, flush: 'sync' })
onMounted(() => {
  autoNewRow()
  enableDrop()
})
onUnmounted(() => sortable.destroy())

/**
 * 最后一行不为空时，自动添加一行
 */
const autoNewRow = () => {
  const list = rows.value
  if (isEmpty(list)) {
    newRow()
  } else {
    const lastRow = list[list.length - 1]
    if (!isBlankRow(lastRow)) newRow()
  }
}

const newRow = () => {
  rows.value.push({ enabled: true, name: '', value: '', desc: '' })
}
const delRow = (index) => {
  rows.value.splice(index, 1)
}
const isBlankRow = (row) => {
  return isEmpty(row.name) && isEmpty(row.value) && isEmpty(row.desc)
}

const enableDrop = () => {
  const el = eltableRef.value.$el.querySelector('.el-table__body tbody')

  sortable = sortablejs.create(el, {
    handle: '.sorted-handle',
    onEnd: ({ newIndex, oldIndex }) => {
      const data = rows.value
      if (newIndex + 1 === data.length) {
        newIndex -= 1
      }
      if (newIndex !== oldIndex) {
        const row = data.splice(oldIndex, 1)[0]
        data.splice(newIndex, 0, row)
      }
      rows.value = []
      nextTick(() => {
        rows.value = data
      })
    }
  })
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
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
  white-space: pre-wrap;
}

:deep(.el-card__header) {
  padding: 5px 10px;
  user-select: none;
}

:deep(.el-table__inner-wrapper::before) {
  height: 0;
}

:deep(.el-empty__description) {
  display: none;
}
</style>

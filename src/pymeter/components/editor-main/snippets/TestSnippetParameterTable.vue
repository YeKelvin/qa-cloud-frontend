<template>
  <el-table ref="eltableRef" :data="rows" style="width: 100%; margin-bottom: 20px" stripe>
    <!-- 空表格 -->
    <template #empty><el-empty description=" " /></template>

    <!-- 排序图标 -->
    <el-table-column align="center" width="40" min-width="40">
      <template #default="{ $index }">
        <SvgIcon v-show="rows.length != $index + 1" icon-name="pymeter-move" class="sorted-handle" />
      </template>
    </el-table-column>

    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="{ row }">
        <FxInput v-model="row.name" />
      </template>
    </el-table-column>

    <!-- 默认值 -->
    <el-table-column label="参数默认值" width="auto">
      <template #default="{ row }">
        <FxInput v-model="row.default" />
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="参数描述" width="auto">
      <template #default="{ row }">
        <FxInput v-model="row.desc" />
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column label="操作" fixed="right" align="center" width="60" min-width="60">
      <template #default="{ $index }">
        <el-button v-show="rows.length != $index + 1" type="primary" link :icon="Delete" @click="delRow($index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import sortablejs from 'sortablejs'

import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'

let sortable = null

const eltableRef = ref()
const props = defineProps({ modelValue: Array })
const emit = defineEmits(['update:modelValue'])
const rows = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
watch(rows, () => autoNewRow(), { deep: true })

onMounted(() => {
  autoNewRow()
  enableDrop()
})
onUnmounted(() => sortable.destroy())

/**
 * 最后一行不为空时，自动添加一行
 */
const autoNewRow = () => {
  if (isEmpty(rows.value)) {
    newRow()
  } else {
    const lastRow = rows.value.at(-1)
    if (!isBlankRow(lastRow)) newRow()
  }
}

const newRow = () => {
  rows.value.push({ name: '', default: '', desc: '' })
}
const delRow = index => {
  rows.value.splice(index, 1)
}
const isBlankRow = param => {
  return isEmpty(param.name) && isEmpty(param.default) && isEmpty(param.desc)
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
span {
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
  white-space: pre-wrap;
}
</style>

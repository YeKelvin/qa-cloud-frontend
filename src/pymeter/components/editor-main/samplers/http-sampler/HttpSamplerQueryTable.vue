<template>
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
    <el-table-column align="center" width="60" min-width="60">
      <template #default="{ row, $index }">
        <el-switch
          v-show="rows.length != $index + 1"
          v-model="row.enabled"
          size="small"
          inline-prompt
          :active-icon="Check"
          :inactive-icon="Close"
        />
      </template>
    </el-table-column>

    <!-- 参数名称 -->
    <el-table-column label="名称" width="auto">
      <template #default="{ row }">
        <FxInput v-model="row.name" />
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="值" width="auto">
      <template #default="{ row }">
        <FxInput v-model="row.value" />
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column v-if="showDesc" label="描述" width="auto">
      <template #default="{ row }">
        <FxInput v-model="row.desc" />
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column fixed="right" width="80" min-width="80">
      <template #header>
        <div class="operation-header">
          <!-- label -->
          <span>操作</span>
          <!-- 更多操作按钮 -->
          <el-dropdown trigger="click" placement="bottom-end">
            <el-button type="primary" link><SvgIcon icon-name="pymeter-more" /></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showDesc = !showDesc">{{ showDesc ? '隐藏' : '显示' }}描述</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
      <template #default="{ $index }">
        <!-- 删除按钮 -->
        <el-button v-show="rows.length != $index + 1" type="danger" link :icon="Delete" @click="delRow($index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { Check, Close, Delete } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import sortablejs from 'sortablejs'

import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'

let sortable = null

const props = defineProps({ modelValue: Array })
const emit = defineEmits(['update:modelValue'])
const rows = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
const showDesc = ref(false)
const eltableRef = ref()

// 表格没有数据时自动添加一行
watch(rows, () => autoNewRow(), { deep: true, flush: 'sync' })
onMounted(() => {
  // autoNewRow()
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
    const lastRow = list.at(-1)
    if (!isBlankRow(lastRow)) newRow()
  }
}

const newRow = () => {
  rows.value.push({ enabled: true, name: '', desc: '', value: '' })
}
const delRow = index => {
  rows.value.splice(index, 1)
}
const isBlankRow = row => {
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
span {
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
  white-space: pre-wrap;
}

.operation-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-empty__description) {
  display: none;
}

:deep(.el-table__inner-wrapper::before) {
  height: 0;
}
</style>

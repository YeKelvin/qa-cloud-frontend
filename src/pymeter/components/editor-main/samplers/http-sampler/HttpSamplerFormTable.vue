<template>
  <el-table ref="eltableRef" stripe style="width: 100%; margin-bottom: 10px" :data="rows">
    <!-- 空表格 -->
    <template #empty>
      <el-empty :image-size="80" />
    </template>

    <!-- 排序图标 -->
    <el-table-column v-if="!queryMode" align="center" width="40" min-width="40">
      <template #default="{ $index }">
        <SvgIcon v-show="rows.length != $index + 1" icon-name="pymeter-move" class="sorted-handle" />
      </template>
    </el-table-column>

    <!-- 是否启用 -->
    <el-table-column v-if="!queryMode" align="center" width="50" min-width="50">
      <template #default="{ row }">
        <el-checkbox v-model="row.enabled" size="large" :disabled="queryMode" />
      </template>
    </el-table-column>

    <!-- 键名 -->
    <el-table-column label="键名" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.name" />
        <span v-else>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 键值 -->
    <el-table-column label="键值" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.value" />
        <span v-else>{{ row.value }}</span>
      </template>
    </el-table-column>

    <!-- 描述 -->
    <el-table-column v-if="showDesc" label="描述" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.desc" />
        <span v-else>{{ row.desc }}</span>
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column fixed="right" width="80" min-width="80">
      <template #header>
        <div class="operation-header">
          <!-- label -->
          <span>操作</span>
          <!-- 更多操作按钮 -->
          <el-dropdown trigger="click">
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
        <el-button type="danger" link :icon="Delete" :disabled="queryMode" @click="delRow($index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'
import { isBlankAll } from '@/utils/string-util'
import { Delete } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import sortablejs from 'sortablejs'

let sortable = null
const emit = defineEmits(['update:data'])
const props = defineProps({
  data: { type: Array, required: true },
  editMode: { type: String, default: 'QUERY' }
})
const eltableRef = ref()
const showDesc = ref(false)
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
onMounted(() => {
  autoNewRow()
  enableDrop()
})
onUnmounted(() => sortable.destroy())

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
  rows.value.push({ enabled: true, name: '', value: '', desc: '' })
}
const delRow = (index) => {
  rows.value.splice(index, 1)
}
const isBlankRow = (row) => {
  return isBlankAll(row.name, row.value, row.desc)
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

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

    <!-- 参数名 -->
    <el-table-column label="参数名" width="auto">
      <template #default="{ row }">
        <FileItem v-model:name="row.name" v-model:argtype="row.argtype" />
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="参数值" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.value" />
        <span v-else>{{ row.value }}</span>
      </template>
    </el-table-column>

    <!-- MIME类型 -->
    <el-table-column v-if="showMimeType" label="MIME类型" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.mimetype" />
        <span v-else>{{ row.mimetype }}</span>
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
                <el-dropdown-item @click="showMimeType = !showMimeType">
                  {{ showMimeType ? '隐藏' : '显示' }}MIME类型
                </el-dropdown-item>
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
import Sortable from 'sortablejs'
import FileItem from './HttpSamplerFileItem.vue'

let sortable = null
const emit = defineEmits(['update:data'])
const props = defineProps({ data: { type: Array, required: true } })
const queryMode = inject('queryMode')
const eltableRef = ref()
const showMimeType = ref(false)
const showDesc = ref(false)
const rows = computed({
  get: () => props.data,
  set: (val) => emit('update:data', val)
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
  rows.value.push({ enabled: true, name: '', value: '', argtype: 'text', mimetype: '', desc: '' })
}
const delRow = (index) => {
  rows.value.splice(index, 1)
}
const isBlankRow = (row) => {
  return isBlankAll(row.name, row.value, row.desc)
}

const enableDrop = () => {
  const el = eltableRef.value.$el.querySelector('.el-table__body tbody')

  sortable = Sortable.create(el, {
    handle: '.sorted-handle',
    onEnd: ({ newIndex, oldIndex }) => {
      const data = rows.value
      if (newIndex + 1 == data.length) {
        newIndex -= 1
      }
      if (newIndex != oldIndex) {
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
  white-space: pre-wrap;
  letter-spacing: 0.6px;
  text-overflow: ellipsis;
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

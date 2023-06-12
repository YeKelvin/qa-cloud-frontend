<template>
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

    <!-- 参数名称 -->
    <el-table-column label="名称" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.name" />
        <span v-else>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="值" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.value" />
        <span v-else>{{ row.value }}</span>
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column v-if="showDesc" label="描述" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.desc" />
        <span v-else>{{ row.desc }}</span>
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column fixed="right" align="center" width="60" min-width="10">
      <template #header>
        <div class="operation-header">
          <el-dropdown trigger="click">
            <el-button type="primary" link :icon="MoreFilled" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showDesc = !showDesc">{{ showDesc ? '隐藏' : '显示' }}描述</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-show="!queryMode" type="primary" link :icon="Plus" @click="newRow()" />
        </div>
      </template>
      <template #default="{ $index }">
        <el-button type="primary" link :icon="Delete" :disabled="queryMode" @click="delRow($index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { isBlankAll } from '@/utils/string-util'
import { Delete, Plus, MoreFilled } from '@element-plus/icons-vue'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'

const emit = defineEmits(['update:data'])
const props = defineProps({
  data: { type: Array, required: true },
  editMode: { type: String, default: 'QUERY' }
})

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
  rows.value.push({ enabled: true, name: '', value: '', desc: '' })
}
const delRow = (index) => {
  rows.value.splice(index, 1)
}
const isBlankRow = (row) => {
  return isBlankAll(row.name, row.value, row.desc)
}
</script>

<style lang="scss" scoped>
span {
  white-space: pre-wrap;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
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

<template>
  <el-table ref="eltableRef" style="width: 100%; margin-bottom: 10px" stripe>
    <!-- 空表格 -->
    <template #empty><el-empty description=" " /></template>

    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.name" />
        <span v-else>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 默认值 -->
    <el-table-column label="参数默认值" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.default" />
        <span v-else>{{ row.default }}</span>
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="参数描述" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.desc" />
        <span v-else>{{ row.desc }}</span>
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column v-if="!queryMode" fixed="right" align="center" width="50" min-width="10">
      <template #header>
        <el-button type="primary" link :icon="Plus" :disabled="queryMode" @click="newRow" />
      </template>
      <template #default="scope">
        <el-button type="primary" link :icon="Delete" :disabled="queryMode" @click="delRow(scope.$index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { isBlankAll } from '@/utils/string-util'
import { Delete, Plus } from '@element-plus/icons-vue'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'

const props = defineProps({
  editMode: { type: String, default: 'QUERY' }
})
const attrs = useAttrs()
const eltableRef = ref()
const queryMode = computed(() => props.editMode === 'QUERY')
const tableData = computed(() => attrs.data)

watch(queryMode, () => {
  // 动态显隐表格列后重新渲染表格
  nextTick(() => {
    eltableRef.value.doLayout()
  })
  // 表格没有数据时自动添加一行
  if (!queryMode.value && isEmpty(tableData.value)) {
    newRow()
  }
})

watch(
  tableData,
  () => {
    if (queryMode.value) return
    if (isEmpty(tableData.value)) {
      newRow()
    } else {
      if (!isBlankRow(tableData.value[tableData.value.length - 1])) newRow()
    }
  },
  { deep: true }
)

onMounted(() => {
  if (queryMode.value) return
  if (isEmpty(tableData.value)) newRow()
})

const newRow = () => {
  attrs.data.push({ name: '', default: '', desc: '' })
}
const delRow = (index) => {
  attrs.data.splice(index, 1)
}
const isBlankRow = (param) => {
  return isBlankAll(param.name, param.default, param.desc)
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

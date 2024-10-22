<template>
  <el-table style="width: 100%; margin-bottom: 20px; border-radius: 4px" stripe>
    <!-- 空表格 -->
    <template #empty><el-empty description=" " /></template>
    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="{ row }">
        <span>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column width="auto">
      <template #header>
        <span style="display: flex; align-items: center; justify-content: space-between">
          <span>参数值</span>
          <span style="display: flex; font-size: 12px">
            <span>默认值</span>
            <el-switch v-model="useDefault" size="small" inline-prompt :active-icon="Check" :inactive-icon="Close" />
          </span>
        </span>
      </template>
      <template #default="{ row }">
        <span v-if="useDefault">{{ row.default }}</span>
        <FxInput v-else v-model="row.value" :placeholder="row.default" />
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="描述" width="auto" align="right">
      <template #default="{ row }">
        <span>{{ row.desc }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { Check, Close } from '@element-plus/icons-vue'

import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'

const emit = defineEmits(['update:useDefault'])
const props = defineProps({
  useDefault: Boolean
})
const useDefault = computed({
  get: () => props.useDefault,
  set: val => emit('update:useDefault', val)
})
</script>

<style lang="scss" scoped>
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
</style>

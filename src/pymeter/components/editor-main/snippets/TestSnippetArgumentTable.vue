<template>
  <el-table style="width: 100%" stripe>
    <!-- 参数名称 -->
    <el-table-column label="参数名" width="auto">
      <template #default="{ row }">
        <span>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="参数值" width="auto">
      <template #default="{ row }">
        <FxInput v-model="row.desc" :placeholder="row.default" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'
</script>

<style lang="scss" scoped>
.el-table {
  &::before {
    height: 0;
  }
}

span {
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
  white-space: pre-wrap;
}
</style>

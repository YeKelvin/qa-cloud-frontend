<template>
  <div class="func-details">
    <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding: 0 10px;">
      <!-- 函数名称 -->
      <el-row>
        <el-col :span="6" class="item-title">函数名称：</el-col>
        <el-col :span="12">{{ func.name }}</el-col>
      </el-row>
      <!-- 函数描述 -->
      <el-row>
        <el-col :span="6" class="item-title">函数说明：</el-col>
        <el-col :span="12">{{ func.desc }}</el-col>
      </el-row>
      <!-- 函数参数 -->
      <template v-if="!isEmpty(func.args)">
        <div class="item-title">函数参数：</div>
        <el-table :data="func.args" style="width: 100%" border flexible stripe highlight-current-row>
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="desc" label="描述" />
          <el-table-column prop="required" label="必填" width="60" min-width="60">
            <template #default="{ row }">
              <span :class="{ required: row.required }">{{ row.required ? '必填' : '选填' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="参数值" class-name="arg-value">
            <template #default="{ row }">
              <template v-if="row.options">
                <el-select v-model="row.value" :placeholder="row.default" :clearable="!row.required">
                  <el-option v-for="option in row.options" :key="option" :label="option" :value="option" />
                </el-select>
              </template>
              <template v-else>
                <FxInput v-model="row.value" :placeholder="row.default" />
              </template>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'

import FxInput from './FunctionInput.vue'

const props = defineProps({
  data: { type: Object, required: true }
})
const func = computed(() => props.data)
</script>

<style lang="scss" scoped>
.func-details {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  padding-top: 40px;
  font-size: 16px;
  color: var(--el-text-color-regular);
}

.item-title {
  font-weight: bold;
  user-select: none;
}

.required {
  color: var(--el-color-danger);
}

.el-row {
  margin-bottom: 25px;
}

.el-table {
  margin-bottom: 25px;
}

:deep(.el-input__wrapper) {
  border-radius: 0;
}

:deep(.el-input__validateIcon) {
  display: none;
}

:deep(.el-select__wrapper) {
  border-radius: 0;
}

:deep(.el-table__body .el-table__cell) {
  padding: 0;
}

:deep(.el-table__body .el-table__cell.arg-value) {
  padding: 0;

  & > .cell {
    padding: 0;
  }
}
</style>

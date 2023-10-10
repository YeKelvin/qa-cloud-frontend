<template>
  <el-card shadow="hover" style="width: 100%">
    <template #header>
      <el-select v-model="asideName" size="large" style="flex-grow: 1">
        <el-option label="测试脚本" value="ELEMENT" />
        <el-option label="环境/变量" value="DATASET" />
        <el-option label="HTTP请求头" value="HTTPHEADER" />
        <el-option label="数据库" value="DATABASE" />
      </el-select>
    </template>

    <component :is="asideComponents[asideName]" />
  </el-card>
</template>

<script setup>
const asideName = ref('ELEMENT')
const asideComponents = reactive({
  ELEMENT: markRaw(defineAsyncComponent(() => import('./element-side/ElementSide.vue'))),
  DATASET: markRaw(defineAsyncComponent(() => import('./dataset-side/DatasetSide.vue'))),
  HTTPHEADER: markRaw(defineAsyncComponent(() => import('./httpheader-side/HttpheaderSide.vue'))),
  DATABASE: markRaw(defineAsyncComponent(() => import('./database-side/DatabaseSide.vue')))
})
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  display: flex;
  padding: 0;

  .el-select {
    --el-select-border-color-hover: none;
    --el-select-input-focus-border-color: none;
  }

  .select-trigger {
    padding: 0 10px;
  }

  .el-input__inner {
    font-size: 16px;
    font-weight: bold;
    box-shadow: none;
  }

  .el-input__wrapper {
    box-shadow: none;
  }
}

:deep(.el-card__body) {
  width: 100%;
  height: 100%;
  padding: 0;
  padding-bottom: 50px;
}
</style>

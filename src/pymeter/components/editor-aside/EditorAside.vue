<template>
  <el-card shadow="hover" style="width: 100%">
    <template #header>
      <el-select v-model="asideName" size="large" style="flex-grow: 1">
        <el-option label="脚本" value="ELEMENT" />
        <el-option label="环境 / 变量" value="DATASET" />
        <el-option label="HTTP请求头" value="HTTP_HEADER_TEMPLATE" />
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
  HTTP_HEADER_TEMPLATE: markRaw(
    defineAsyncComponent(() => import('./httpheader-template-side/HttpheaderTemplateSide.vue'))
  ),
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
    box-shadow: none;
    font-size: 16px;
    font-weight: bold;
  }

  .el-input__wrapper {
    box-shadow: none;
  }
}

:deep(.el-card__body) {
  height: 100%;
  width: 100%;
  padding: 0;
  padding-bottom: 50px;
}
</style>

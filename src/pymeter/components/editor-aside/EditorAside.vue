<template>
  <el-card shadow="hover" style="width: 100%">
    <template #header>
      <a-radio-group v-model="asideName" type="button" size="large" style="flex-grow: 1">
        <a-radio value="ELEMENTS">
          <SvgIcon icon-name="pymeter-script3" style="margin-right: 5px; font-size: 20px" />
          <span>测试脚本</span>
        </a-radio>
        <a-radio value="VARIABLES">
          <SvgIcon icon-name="pymeter-variable" style="margin-right: 5px; font-size: 20px" />
          <span>环境变量</span>
        </a-radio>
      </a-radio-group>
    </template>

    <component :is="asideComponents[asideName]" />
  </el-card>
</template>

<script setup>
const asideName = ref('ELEMENTS')
const asideComponents = reactive({
  ELEMENTS: markRaw(defineAsyncComponent(() => import('./element-side/ElementSide.vue'))),
  VARIABLES: markRaw(defineAsyncComponent(() => import('./dataset-side/DatasetSide.vue')))
})
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  display: flex;
  padding: 0;
}

:deep(.el-card__body) {
  width: 100%;
  height: 100%;
  padding: 0;
  padding-bottom: 50px;
}

:deep(.arco-radio-button) {
  flex: 1;
}

:deep(.arco-radio-button-content) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.arco-radio-button.arco-radio-checked) {
  font-size: 16px;
  color: var(--el-color-primary);
}
</style>

<template>
  <el-select
    v-model="selectedDatasets"
    popper-class="dataset-select-popper"
    placeholder="环境 / 变量"
    tag-type="danger"
    multiple
    collapse-tags
    collapse-tags-tooltip
    clearable
  >
    <el-option-group v-if="!isEmpty(pymeterStore.customDatasetList)" key="custom" label="自定义">
      <el-option
        v-for="item in pymeterStore.customDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      />
    </el-option-group>
    <el-option-group v-if="!isEmpty(pymeterStore.environmentDatasetList)" key="environment" label="环境">
      <el-option
        v-for="item in pymeterStore.environmentDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
        :disabled="item.disabled"
      />
    </el-option-group>

    <el-option-group key="global" label="全局">
      <el-option
        v-for="item in pymeterStore.globalDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      />
    </el-option-group>
  </el-select>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { usePyMeterStore } from '@/store/pymeter'

const props = defineProps({
  show: { type: Boolean, default: () => false }
})
const pymeterStore = usePyMeterStore()
const selectedDatasets = computed({
  get() {
    return pymeterStore.selectedDatasets
  },
  set(val) {
    if (props.show) pymeterStore.setSelectedDatasets(val)
  }
})

onMounted(() => {
  pymeterStore.queryDatasetAll()
})
</script>

<style lang="scss">
.dataset-select-popper {
  width: 214.5px;
}
</style>

<style lang="scss" scoped>
.el-select {
  --el-select-border-color-hover: none;
  --el-select-input-focus-border-color: none;

  :deep(.el-select__tags-text) {
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  :deep(.el-select-dropdown__item span) {
    padding-right: 10px;
  }
}

:deep(.el-input__wrapper) {
  box-shadow: none;
}

:deep(.el-input__inner) {
  border: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: none;
}

:deep(.el-tag__close) {
  display: none;
}

:deep(.el-tag.is-closable) {
  padding-right: 9px;
}
</style>

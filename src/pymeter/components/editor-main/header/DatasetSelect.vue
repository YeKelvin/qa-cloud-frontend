<template>
  <el-select
    v-model="selectedDatasets"
    popper-class="dataset-select-popper"
    placeholder="环境 / 变量"
    style="width: 260px"
    tag-type="danger"
    multiple
    clearable
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="2"
  >
    <!-- 自定义变量 -->
    <el-option-group v-if="!isEmpty(filteredDatasetListAsCustom)" key="custom" label="自定义">
      <el-option
        v-for="item in filteredDatasetListAsCustom"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      >
        <span style="display: flex; align-items: center; justify-content: space-between">
          <span>{{ item.datasetName }}</span>
          <span>
            <el-tag v-if="item.datasetBinding" type="info" size="small" style="margin: 5px" disable-transitions>
              {{ getBoundDatasetName(item.datasetBinding) }}
            </el-tag>
          </span>
        </span>
      </el-option>
    </el-option-group>
    <!-- 环境变量 -->
    <el-option-group v-if="!isEmpty(datasetListAsEnvironment)" key="environment" label="环境">
      <el-option
        v-for="item in datasetListAsEnvironment"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
        :disabled="item.disabled"
      />
    </el-option-group>
    <!-- 空间变量 -->
    <el-option-group key="workspace" label="空间">
      <el-option
        v-for="item in datasetListAsWorkspace"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
        :disabled="item.disabled"
      />
    </el-option-group>
    <!-- 全局变量 -->
    <el-option-group key="global" label="全局">
      <el-option
        v-for="item in datasetListAsGlobal"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      />
    </el-option-group>
  </el-select>
</template>

<script setup>
import { isEmpty } from 'lodash-es'

import useDataset from '@/pymeter/composables/useDataset'

const {
  selectedDatasets,
  datasetListAsGlobal,
  datasetListAsWorkspace,
  datasetListAsEnvironment,
  filteredDatasetListAsCustom,
  getBoundDatasetName
} = useDataset()
const props = defineProps({
  show: { type: Boolean, default: () => false }
})
</script>

<style lang="scss">
.dataset-select-popper {
  width: calc(260px + 25px);

  .el-tag {
    color: inherit;
  }
}
</style>

<style lang="scss" scoped>
.el-select {
  --el-select-border-color-hover: none;
  --el-select-input-focus-border-color: none;

  :deep(.el-select__wrapper) {
    box-shadow: none;
  }

  :deep(.el-select__tags-text) {
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

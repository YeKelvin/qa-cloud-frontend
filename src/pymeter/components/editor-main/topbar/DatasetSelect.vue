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
  >
    <!-- 自定义变量 -->
    <el-option-group v-if="!isEmpty(filteredCustomDatasetList)" key="custom" label="自定义">
      <el-option
        v-for="item in filteredCustomDatasetList"
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
    <el-option-group v-if="!isEmpty(pymeterStore.environmentDatasetList)" key="environment" label="环境">
      <el-option
        v-for="item in pymeterStore.environmentDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
        :disabled="item.disabled"
      />
    </el-option-group>
    <!-- 空间变量 -->
    <el-option-group v-if="!isEmpty(pymeterStore.workspaceDatasetList)" key="workspace" label="空间">
      <el-option
        v-for="item in pymeterStore.workspaceDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
        :disabled="item.disabled"
      />
    </el-option-group>
    <!-- 全局变量 -->
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
import { usePyMeterStore } from '@/store/pymeter'
import { isEmpty } from 'lodash-es'

const pymeterStore = usePyMeterStore()
const props = defineProps({
  show: { type: Boolean, default: () => false }
})
const selectedDatasets = computed({
  get() {
    return pymeterStore.selectedDatasets
  },
  set(val) {
    if (props.show) pymeterStore.setSelectedDatasets(val)
  }
})
const filteredCustomDatasetList = computed(() => {
  if (!pymeterStore.selectedEnvironmentNo) {
    return pymeterStore.customDatasetList
  }
  return pymeterStore.customDatasetList.filter(
    (item) => !item.datasetBinding || item.datasetBinding === pymeterStore.selectedEnvironmentNo
  )
})

onMounted(() => {
  pymeterStore.queryDatasetAll()
})

const getBoundDatasetName = (datasetNo) => {
  const results = pymeterStore.environmentDatasetList.filter((item) => item.datasetNo === datasetNo)
  return results ? results[0].datasetName : ''
}
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

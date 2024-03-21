<template>
  <el-select v-model="selectedDatasets" placeholder="环境 / 变量" tag-type="danger" style="width: 100%" multiple>
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between">
        <span style="font-size: 14px; font-weight: bold; color: var(--el-text-color-regular)">使用变量当前值</span>
        <el-switch v-model="useCurrvalue" inline-prompt :active-icon="Check" :inactive-icon="Close" />
      </div>
    </template>
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
    <el-option-group v-if="!isEmpty(datasetListAsWorkspace)" key="workspace" label="空间">
      <el-option
        v-for="item in datasetListAsWorkspace"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
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
import { Check, Close } from '@element-plus/icons-vue'
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

const emit = defineEmits(['update:modelValue', 'update:useCurrvalue'])
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  useCurrvalue: { type: Boolean, default: false }
})
const useCurrvalue = computed({
  get: () => props.useCurrvalue,
  set: (val) => emit('update:useCurrvalue', val)
})
</script>

<style lang="scss" scoped></style>

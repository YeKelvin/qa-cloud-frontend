<template>
  <div style="margin: 10px 0">
    <span style="font-weight: 400">环境绑定：</span>
    <el-select v-model="localvalue" clearable style="width: 100%">
      <el-option
        v-for="item in pymeterStore.environmentDatasetList"
        :key="item.datasetNo"
        :value="item.datasetNo"
        :label="item.datasetName"
      />
    </el-select>
  </div>
</template>

<script setup>
import { usePyMeterStore } from '@/store/pymeter'

const pymeterStore = usePyMeterStore()
const props = defineProps({ modelValue: { type: String } })
const emit = defineEmits(['update:modelValue'])

const localvalue = ref(props.modelValue)

watch(localvalue, (val) => emit('update:modelValue', val))
</script>

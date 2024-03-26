<template>
  <el-form label-width="100px" style="width: 100%">
    <el-form-item label="计划名称：">
      <b style="font-size: 16px; color: #f56c6c">{{ planName }}</b>
    </el-form-item>

    <!-- 环境/变量 -->
    <el-form-item label="环境/变量：" required>
      <!-- 变量选择下拉框 -->
      <DatasetSelect v-model="selectedDatasets" v-model:use-currvalue="useCurrvalue" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import DatasetSelect from '@/pages/components/DatasetSelect.vue'

const emit = defineEmits(['update:useCurrentValue', 'update:selectedDatasets'])
const props = defineProps({ planName: { type: String, required: true } })
const useCurrvalue = ref(false)
const selectedDatasets = ref([])

watch(useCurrvalue, () => emit('update:useCurrentValue', useCurrvalue.value))
watch(selectedDatasets, () => emit('update:selectedDatasets', selectedDatasets.value))
</script>

<style lang="scss">
.dataset-popper {
  .el-tag {
    color: inherit;
  }
}
</style>

<style lang="scss" scoped></style>

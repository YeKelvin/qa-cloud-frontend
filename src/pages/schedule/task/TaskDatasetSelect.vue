<template>
  <el-select placeholder="环境 / 变量" tag-type="danger" style="width: 100%" multiple>
    <el-option-group v-if="!_isEmpty(customDatasetList)" key="custom" label="自定义">
      <el-option
        v-for="item in customDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      />
    </el-option-group>
    <el-option-group v-if="!_isEmpty(environmentDatasetList)" key="environment" label="环境">
      <el-option
        v-for="item in environmentDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
        :disabled="item.disabled"
      />
    </el-option-group>

    <el-option-group key="global" label="全局">
      <el-option
        v-for="item in globalDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      />
    </el-option-group>
  </el-select>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import * as VariablesService from '@/api/script/variables'

const attrs = useAttrs()
const props = defineProps({
  workspaceNo: { type: String, required: true }
})
const globalDatasetList = ref([])
const environmentDatasetList = ref([])
const customDatasetList = ref([])

watch(
  () => attrs.modelValue,
  () => {
    // 没有选中任何变量集时，开放所有环境变量集
    if (_isEmpty(attrs.modelValue)) {
      environmentDatasetList.value.forEach((env) => (env.disabled = false))
    }
    // 判断当前选中的变量集是否需要禁用
    let environmentCount = 0
    attrs.modelValue.forEach((datasetNo) => {
      if (isGlobal(datasetNo) || isCustom(datasetNo)) return
      // 已经选择了环境变量集，禁用其余环境变量集
      if (isEnvironment(datasetNo)) {
        environmentCount += 1
        environmentDatasetList.value.forEach((env) => (env.disabled = env.datasetNo !== datasetNo))
      }
    })
    // 没有选择环境变量集时，开放所有环境变量集
    if (environmentCount === 0) {
      environmentDatasetList.value.forEach((env) => (env.disabled = false))
    }
  }
)

onMounted(() => {
  queryDatasetALL()
})

const isGlobal = (datasetNo) => {
  const index = globalDatasetList.value.findIndex((item) => item.datasetNo === datasetNo)
  return index > -1
}
const isEnvironment = (datasetNo) => {
  const index = environmentDatasetList.value.findIndex((item) => item.datasetNo === datasetNo)
  return index > -1
}
const isCustom = (datasetNo) => {
  const index = customDatasetList.value.findIndex((item) => item.datasetNo === datasetNo)
  return index > -1
}

/**
 * 查询所有变量集
 */
const queryDatasetALL = async () => {
  // 查询变量集列表
  const response = await VariablesService.queryVariableDatasetAll({ workspaceNo: props.workspaceNo })

  globalDatasetList.value = response.data.filter((item) => item.datasetType === 'GLOBAL')
  environmentDatasetList.value = response.data.filter((item) => item.datasetType === 'ENVIRONMENT')
  customDatasetList.value = response.data.filter((item) => item.datasetType === 'CUSTOM')
}
</script>

<style lang="scss" scoped></style>

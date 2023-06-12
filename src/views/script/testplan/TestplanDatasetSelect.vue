<template>
  <el-form label-position="right" label-width="110px" style="width: 100%" :model="formData" :rules="formRules">
    <el-form-item label="计划名称：">
      <b style="color: #f56c6c">{{ planName }}</b>
    </el-form-item>

    <!-- 环境/变量 -->
    <el-form-item label="环境/变量：" prop="datasets">
      <!-- 变量选择下拉框 -->
      <el-select
        v-model="formData.datasets"
        placeholder="环境 / 变量"
        tag-type="danger"
        style="width: 100%"
        multiple
        v-bind="$attrs"
      >
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
    </el-form-item>
    <!-- 是否使用当前值 -->
    <el-form-item label="使用当前值：" prop="useCurrentValue" style="margin-bottom: 0">
      <el-switch v-model="formData.useCurrentValue" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import * as VariablesService from '@/api/script/variables'

const emit = defineEmits(['change-datasets', 'change-use-current-value'])
const props = defineProps({
  workspaceNo: { type: String, required: true },
  planName: { type: String, required: true }
})
const globalDatasetList = ref([])
const environmentDatasetList = ref([])
const customDatasetList = ref([])
const formData = reactive({
  datasets: [],
  useCurrentValue: false
})
const formRules = reactive({
  datasets: [{ required: true, message: '测试环境不能为空', trigger: 'blur' }]
})

watch(
  () => formData.datasets,
  () => {
    // 没有选中任何变量集时，开放所有环境变量集
    if (_isEmpty(formData.datasets)) {
      environmentDatasetList.value.forEach((env) => (env.disabled = false))
    }
    // 判断当前选中的变量集是否需要禁用
    let environmentCount = 0
    formData.datasets.forEach((datasetNo) => {
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
    emit('change-datasets', formData.datasets)
  }
)
watch(
  () => formData.useCurrentValue,
  () => emit('change-use-current-value', formData.useCurrentValue)
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

  globalDatasetList.value = response.result.filter((item) => item.datasetType === 'GLOBAL')
  environmentDatasetList.value = response.result.filter((item) => item.datasetType === 'ENVIRONMENT')
  customDatasetList.value = response.result.filter((item) => item.datasetType === 'CUSTOM')
}
</script>

<style lang="scss" scoped></style>

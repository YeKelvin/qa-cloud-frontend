<template>
  <el-form label-width="110px" style="width: 100%" :model="formData" :rules="formRules">
    <el-form-item label="计划名称：">
      <b style="color: #f56c6c">{{ planName }}</b>
    </el-form-item>

    <!-- 环境/变量 -->
    <el-form-item label="环境/变量：" prop="datasets">
      <!-- 变量选择下拉框 -->
      <el-select
        v-model="formData.datasets"
        popper-class="dataset-popper"
        placeholder="环境 / 变量"
        tag-type="danger"
        style="width: 100%"
        multiple
        v-bind="$attrs"
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
        <el-option-group v-if="!isEmpty(environmentDatasetList)" key="environment" label="环境">
          <el-option
            v-for="item in environmentDatasetList"
            :key="item.datasetNo"
            :label="item.datasetName"
            :value="item.datasetNo"
            :disabled="item.disabled"
          />
        </el-option-group>
        <!-- 空间变量 -->
        <el-option-group v-if="!isEmpty(workspaceDatasetList)" key="workspace" label="空间">
          <el-option
            v-for="item in workspaceDatasetList"
            :key="item.datasetNo"
            :label="item.datasetName"
            :value="item.datasetNo"
            :disabled="item.disabled"
          />
        </el-option-group>
        <!-- 全局变量 -->
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
      <el-switch v-model="formData.useCurrentValue" inline-prompt :active-icon="Check" :inactive-icon="Close" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { Check, Close } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'

import * as VariablesService from '@/api/script/variables'

const emit = defineEmits(['change-datasets', 'change-use-current-value'])
const props = defineProps({
  workspaceNo: { type: String, required: true },
  planName: { type: String, required: true }
})
const selectedEnvironmentNo = ref('')
const datasetList = ref([])
const globalDatasetList = ref([])
const workspaceDatasetList = ref([])
const environmentDatasetList = ref([])
const customDatasetList = ref([])
const formData = reactive({
  datasets: [],
  useCurrentValue: false
})
const formRules = reactive({
  datasets: [{ required: true, message: '测试环境不能为空', trigger: 'blur' }]
})
const filteredCustomDatasetList = computed(() => {
  if (!selectedEnvironmentNo.value) {
    return customDatasetList.value
  }
  return customDatasetList.value.filter(
    (item) => !item.datasetBinding || item.datasetBinding === selectedEnvironmentNo.value
  )
})

watch(
  () => formData.datasets,
  () => {
    // 没有选中任何变量集时，开放所有环境变量集
    if (isEmpty(formData.datasets)) {
      environmentDatasetList.value.forEach((env) => (env.disabled = false))
    }
    // 从已选择的变量集中过滤出环境变量集
    const envs = datasetList.value.filter(
      (item) => item.datasetType === 'ENVIRONMENT' && formData.datasets.includes(item.datasetNo)
    )

    if (envs.length > 0) {
      selectedEnvironmentNo.value = envs[0].datasetNo
      // 已经选择了环境变量集，禁用其余环境变量集
      environmentDatasetList.value.forEach((item) => (item.disabled = item.datasetNo !== envs[0].datasetNo))
    } else {
      selectedEnvironmentNo.value = ''
      // 没有选择环境变量集时，开放所有环境变量集
      environmentDatasetList.value.forEach((item) => (item.disabled = false))
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

/**
 * 查询所有变量集
 */
const queryDatasetALL = async () => {
  // 查询变量集列表
  const response = await VariablesService.queryVariableDatasetAll({ workspaceNo: props.workspaceNo })
  datasetList.value = response.data
  globalDatasetList.value = response.data.filter((item) => item.datasetType === 'GLOBAL')
  workspaceDatasetList.value = response.data.filter((item) => item.datasetType === 'WORKSPACE')
  environmentDatasetList.value = response.data.filter((item) => item.datasetType === 'ENVIRONMENT')
  customDatasetList.value = response.data.filter((item) => item.datasetType === 'CUSTOM')
}

const getBoundDatasetName = (datasetNo) => {
  const results = environmentDatasetList.value.filter((item) => item.datasetNo === datasetNo)
  return results ? results[0].datasetName : ''
}
</script>

<style lang="scss">
.dataset-popper {
  .el-tag {
    color: inherit;
  }
}
</style>

<style lang="scss" scoped></style>

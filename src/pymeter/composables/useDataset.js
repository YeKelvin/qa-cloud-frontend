import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { isEmpty } from 'lodash-es'

import * as VariablesService from '@/api/script/variables'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'

export default function useDataset() {
  const instance = getCurrentInstance()

  const workspaceStore = useWorkspaceStore()
  const pymeterStore = usePyMeterStore()
  const queryClient = useQueryClient()
  const workspaceNo = computed(() => workspaceStore.workspaceNo)

  // 已选择的变量集编号列表
  const selectedDatasets = computed({
    get: () => ('modelValue' in instance.props ? instance.props.modelValue : pymeterStore.selectedDatasets),
    set: (value) => {
      if ('modelValue' in instance.props) {
        instance.emit('update:modelValue', value)
      } else {
        pymeterStore.setSelectedDatasets(value)
      }
    }
  })
  // 已选择的环境变量集编号
  const selectedEnvironmentNo = ref('')

  // 所有变量集列表
  const { data: datasetList } = useQuery({
    staleTime: 1000 * 60 * 5, // 5分钟过期
    queryKey: ['VariableDataset', workspaceNo],
    queryFn: async () => {
      const response = await VariablesService.queryVariableDatasetAll({ workspaceNo: workspaceNo.value })
      return response.data
    }
  })
  // 全局变量集列表
  const datasetListAsGlobal = ref([])
  // 空间变量集列表
  const datasetListAsWorkspace = ref([])
  // 环境变量集列表
  const datasetListAsEnvironment = ref([])
  // 自定义变量集列表
  const datasetListAsCustom = ref([])
  const filteredDatasetListAsCustom = computed(() => {
    if (isEmpty(selectedEnvironmentNo.value)) {
      return datasetListAsCustom.value
    }
    return datasetListAsCustom.value.filter(
      (item) => !item.datasetBinding || item.datasetBinding === selectedEnvironmentNo.value
    )
  })

  /**
   * 设置数据
   */
  const setData = () => {
    // 重置数据
    resetData()
    if (isEmpty(datasetList.value)) return
    // 分类存储变量集
    classifyStorageDataset()
    // 判断是否存在无效数据，存在则删除
    // 当前选择的变量集不为空且不在变量集列表中时（表示该变量集已无效），删除该变量集编号
    deleteInvalidDataset()
    // 禁用其余未选择的环境变量集
    disableUnselectedEnvironment()
  }

  /**
   * 重置数据
   */
  const resetData = () => {
    datasetListAsGlobal.value = []
    datasetListAsWorkspace.value = []
    datasetListAsEnvironment.value = []
    datasetListAsCustom.value = []
  }

  /**
   * 分类存储变量集
   */
  const classifyStorageDataset = () => {
    datasetList.value.forEach((item) => {
      switch (item.datasetType) {
        // 全局变量
        case 'GLOBAL': {
          datasetListAsGlobal.value.push({
            datasetNo: item.datasetNo,
            datasetName: item.datasetName,
            datasetDesc: item.datasetDesc,
            datasetType: item.datasetType,
            datasetBinding: item.datasetBinding
          })
          break
        }
        // 空间变量
        case 'WORKSPACE': {
          datasetListAsWorkspace.value.push({
            datasetNo: item.datasetNo,
            datasetName: item.datasetName,
            datasetDesc: item.datasetDesc,
            datasetType: item.datasetType,
            datasetBinding: item.datasetBinding
          })
          break
        }
        // 环境变量
        case 'ENVIRONMENT': {
          datasetListAsEnvironment.value.push({
            datasetNo: item.datasetNo,
            datasetName: item.datasetName,
            datasetDesc: item.datasetDesc,
            datasetType: item.datasetType,
            datasetBinding: item.datasetBinding
          })
          break
        }
        // 自定义变量
        case 'CUSTOM': {
          datasetListAsCustom.value.push({
            datasetNo: item.datasetNo,
            datasetName: item.datasetName,
            datasetDesc: item.datasetDesc,
            datasetType: item.datasetType,
            datasetBinding: item.datasetBinding
          })
          break
        }
      }
    })
  }

  /**
   * 删除无效的已选变量集
   */
  const deleteInvalidDataset = () => {
    if (selectedDatasets.value === undefined) return
    const len = selectedDatasets.value.length
    if (len === 0) return
    const datasets = new Set(datasetList.value.map((item) => item.datasetNo))
    for (let i = len - 1; i >= 0; i--) {
      // 删除无效数据
      if (!datasets.has(selectedDatasets.value[i])) {
        selectedDatasets.value.splice(i, 1)
      }
    }
  }

  /**
   * 禁用未选择的环境变量集（已选择了一个环境变量集的情况下）
   */
  const disableUnselectedEnvironment = () => {
    if (selectedDatasets.value === undefined) return
    // 没有选中任何变量集时，开放所有环境变量集
    if (isEmpty(selectedDatasets.value)) {
      datasetListAsEnvironment.value.forEach((item) => (item.disabled = false))
    }
    // 从已选择的变量集中过滤出环境变量集
    const environments = datasetListAsEnvironment.value.filter(
      (item) => item.datasetType === 'ENVIRONMENT' && selectedDatasets.value.includes(item.datasetNo)
    )
    // 记录当前已选择的环境编号
    if (environments.length > 0) {
      // 存储当前环境编号
      selectedEnvironmentNo.value = environments[0].datasetNo
      // 已经选择了环境变量集，禁用其余环境变量集
      datasetListAsEnvironment.value.forEach((item) => (item.disabled = item.datasetNo !== environments[0].datasetNo))
    } else {
      // 清空环境编号
      selectedEnvironmentNo.value = ''
      // 没有选择环境变量集时，开放所有环境变量集
      datasetListAsEnvironment.value.forEach((item) => (item.disabled = false))
    }
  }

  /**
   * 删除 vue-query 缓存
   */
  const removeQueryCache = async () => {
    await queryClient.cancelQueries({ queryKey: ['VariableDataset', workspaceNo] })
    await queryClient.invalidateQueries({ queryKey: ['VariableDataset', workspaceNo] })
  }

  /**
   * 获取已绑定的变量集名称
   */
  const getBoundDatasetName = (datasetNo) => {
    const results = datasetListAsEnvironment.value.filter((item) => item.datasetNo === datasetNo)
    return !isEmpty(results) ? results[0].datasetName : ''
  }

  onMounted(() => setData())

  watch(datasetList, () => setData())
  watch(selectedDatasets, () => disableUnselectedEnvironment())

  return {
    datasetList,
    datasetListAsGlobal,
    datasetListAsWorkspace,
    datasetListAsEnvironment,
    datasetListAsCustom,
    filteredDatasetListAsCustom,
    selectedDatasets,
    selectedEnvironmentNo,
    removeQueryCache,
    getBoundDatasetName
  }
}

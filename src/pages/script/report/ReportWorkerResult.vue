<template>
  <div class="details-container">
    <el-descriptions :column="1">
      <el-descriptions-item label="用例名称：">{{ details.workerName }}</el-descriptions-item>
      <el-descriptions-item v-if="details.workerDesc" label="用例描述：">
        {{ details.workerDesc }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="3" style="margin-bottom: 20px">
      <el-descriptions-item label="开始时间：">
        <el-tag type="warning" disable-transitions>{{ details.startTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="结束时间：">
        <el-tag type="warning" disable-transitions>{{ details.endTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="耗时：">
        <el-tag type="danger" disable-transitions>{{ details.elapsedTime }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <div style="display: flex; align-content: center; justify-content: space-between">
      <el-table :data="totalData" highlight-current-row style="width: 50%; height: 400px">
        <el-table-column prop="totalType" label="统计" />
        <el-table-column prop="samplerTotal" label="请求" />
      </el-table>

      <div ref="pieChartRef" style="width: 50%; height: 400px" />
    </div>
  </div>
</template>

<script setup>
import useECharts from '@/composables/useECharts'
import * as ReportService from '@/api/script/report'

const props = defineProps({
  workerId: { type: String, default: '' }
})
const details = ref({})
const { echarts } = useECharts()
const pieChartRef = ref()
const pieChart = ref(null)
const pieChartOption = reactive({
  title: {
    text: '请求',
    left: 'center',
    top: '20',
    textStyle: { color: '#606266' }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: '60',
    data: ['成功', '失败']
  },
  series: [
    {
      name: '请求',
      type: 'pie',
      radius: [0, '60%'],
      center: ['50%', '50%'],
      data: [
        { value: 0, name: '成功', itemStyle: { color: '#44B197' } },
        { value: 0, name: '失败', itemStyle: { color: '#FF7676' } }
      ],
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: (idx) => Math.random() * 200
    }
  ]
})
const totalData = computed(() => {
  return [
    {
      totalType: '总数',
      samplerTotal: details.value.successfulSamplerTotal + details.value.failedSamplerTotal
    },
    {
      totalType: '成功总数',
      samplerTotal: details.value.successfulSamplerTotal
    },
    {
      totalType: '失败总数',
      samplerTotal: details.value.failedSamplerTotal
    },
    {
      totalType: '成功率',
      samplerTotal: successRate(details.value.successfulSamplerTotal, details.value.failedSamplerTotal)
    },
    {
      totalType: '平均响应时间',
      samplerTotal: details.value.avgSamplersElapsedTime
    }
  ]
})

watch(
  () => props.workerId,
  (val) => {
    if (!val) return
    queryWorkerResult()
  }
)

onMounted(() => {
  // 初始化 ECharts
  pieChart.value = echarts.init(pieChartRef.value)
  pieChart.value.setOption(pieChartOption, true)
  // 添加窗口尺寸变更事件
  window.addEventListener('resize', pieChart.value.resize)
  // 查询 CollectionResult
  if (!props.workerId) return
  queryWorkerResult()
})

onUnmounted(() => {
  // 移除窗口尺寸变更事件
  window.removeEventListener('resize', pieChart.value.resize)
  // 销毁 echarts 实例
  pieChart.value.dispose()
})

const queryWorkerResult = () => {
  ReportService.queryWorkerResult({ workerId: props.workerId }).then((response) => {
    details.value = response.result
    setPieChartData([
      { value: details.value.successfulSamplerTotal, name: '成功', itemStyle: { color: '#44B197' } },
      { value: details.value.failedSamplerTotal, name: '失败', itemStyle: { color: '#FF7676' } }
    ])
  })
}

const setPieChartData = (data) => {
  const option = pieChart.value.getOption()
  option.series[0].data = data.sort((a, b) => {
    return a.value - b.value
  })
  pieChart.value.setOption(option, true)
  pieChart.value.resize()
}

const successRate = (successfulTotal, failedTotal) => {
  const total = successfulTotal + failedTotal
  return `${Math.round((successfulTotal / total) * 10000) / 100}%`
}
</script>

<style lang="scss" scoped>
.details-container {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.el-table {
  &::before {
    height: 0;
  }
}

.el-descriptions {
  :deep(.el-descriptions__label) {
    margin-right: 0;
    font-weight: bold;
    color: #606266;
  }

  :deep(.el-descriptions-item__container) {
    display: inline-flex;
    align-items: center;
  }
}

:deep(.el-descriptions-row) {
  display: flex;
  flex-wrap: wrap;

  .el-descriptions-item {
    margin-right: 20px;
  }

  .el-descriptions-item__label {
    margin-right: 5px;
  }
}
</style>

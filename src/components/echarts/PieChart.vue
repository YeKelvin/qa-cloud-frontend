<template>
  <div ref="echartRef" :style="style" />
</template>

<script setup>
import useECharts from '@/composables/useECharts'

const props = defineProps({
  option: { type: Object, default: () => ({}) }
})
const echartRef = ref()
const { echarts } = useECharts()

onMounted(() => {
  echarts.init(echartRef.value).setOption(props.option)
})
</script>

<style lang="scss" scoped></style>

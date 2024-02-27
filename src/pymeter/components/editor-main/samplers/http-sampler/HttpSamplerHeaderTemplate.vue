<template>
  <!-- 请求头模板卡片 -->
  <el-card shadow="hover" :body-style="{ padding: '10px' }">
    <!-- 卡片头 -->
    <template #header><span>模板</span></template>

    <el-tag v-if="showWarning" type="danger" size="large" style="margin-bottom: 10px" disable-transitions>
      警告：此请求头模板不属于此工作空间，可能存在未知风险，请重新编辑
    </el-tag>

    <!-- 请求头模板列表 -->
    <el-select
      v-model="localModel"
      v-bind="$attrs"
      style="width: 100%; margin-bottom: 5px"
      multiple
      @change="handleChange"
    >
      <el-option
        v-for="item in pymeterStore.httpheaderTemplateList"
        :key="item.templateNo"
        :label="item.templateName"
        :value="item.templateNo"
      />
    </el-select>

    <!-- 查看详情按钮 -->
    <el-button
      v-if="!showDetails"
      type="primary"
      link
      :icon="ArrowDown"
      :disabled="isEmpty(localModel)"
      @click="showHeaders"
    >
      展开
    </el-button>

    <!-- 模板下的请求头表格 -->
    <el-table v-else-if="rows.length > 0" style="width: 100%; margin-bottom: 10px" stripe :data="rows">
      <!-- header名称 -->
      <el-table-column prop="name" label="请求头名称" />
      <!-- header值 -->
      <el-table-column prop="value" label="请求头内容" />
    </el-table>
  </el-card>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import { isEmpty } from 'lodash-es'
import { ArrowDown } from '@element-plus/icons-vue'
import { usePyMeterStore } from '@/store/pymeter'

const pymeterStore = usePyMeterStore()
const emit = defineEmits(['update:modelValue'])
const props = defineProps({ modelValue: Array })
const localModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const rows = ref([])
const templates = computed(() => pymeterStore.httpheaderTemplateList.map((item) => item.templateNo))
const showDetails = ref(false)
const showWarning = computed(() => {
  const selectedList = localModel.value
  for (const templateNo of selectedList) {
    if (!templates.value.includes(templateNo)) {
      return true
    }
  }
  return false
})

/**
 * 查询请求头模板下的所有请求头
 */
const queryHTTPHeaders = () => {
  ElementService.queryHTTPHeaderAllByTemplate({ templates: [...localModel.value] }).then((response) => {
    rows.value = response.result
  })
}

/**
 * 选择变更事件
 */
const handleChange = () => {
  nextTick(() => {
    if (!showDetails.value) return
    queryHTTPHeaders()
  })
}

/**
 * 显示请求头模板内的所有请求头
 */
const showHeaders = () => {
  queryHTTPHeaders()
  showDetails.value = true
}
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: 5px 10px;
  user-select: none;
}
</style>

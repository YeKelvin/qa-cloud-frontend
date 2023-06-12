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
      :disabled="queryMode"
      @change="handleChange"
    >
      <!-- 个人空间时显示所有能访问空间下的模板 -->
      <template v-if="workspaceStore.workspaceScope === 'PRIVATE'">
        <el-option
          v-for="item in pymeterStore.httpheaderTemplateListInPrivate"
          :key="item.templateNo"
          :label="item.templateName + ' ( ' + item.workspaceName + ' )'"
          :value="item.templateNo"
        >
          <span style="display: flex; justify-content: space-between; align-items: center">
            <span>{{ item.templateName }}</span>
            <el-tag type="info" size="small" disable-transitions>{{ item.workspaceName }}</el-tag>
          </span>
        </el-option>
      </template>
      <!-- 非个人空间时仅显示当前空间下的模板 -->
      <template v-else>
        <el-option
          v-for="item in pymeterStore.httpheaderTemplateList"
          :key="item.templateNo"
          :label="item.templateName"
          :value="item.templateNo"
        />
      </template>
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
      查看详情
    </el-button>

    <!-- 模板下的请求头表格 -->
    <el-table v-else-if="rows.length > 0" style="width: 100%; margin-bottom: 10px" stripe :data="rows">
      <!-- header名称 -->
      <el-table-column prop="headerName" label="请求头名称" />
      <!-- header值 -->
      <el-table-column prop="headerValue" label="请求头内容" />
    </el-table>
  </el-card>
</template>

<script setup>
import * as HeadersService from '@/api/script/headers'
import { isEmpty } from 'lodash-es'
import { ArrowDown } from '@element-plus/icons-vue'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  editMode: { type: String, default: 'QUERY' }
})
const attrs = useAttrs()
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

const rows = ref([])
const showDetails = ref(false)
const queryMode = computed(() => props.editMode === 'QUERY')
const templates = computed(() => pymeterStore.httpheaderTemplateList.map((item) => item.templateNo))
const showWarning = computed(() => {
  const selectedList = localModel.value
  for (const templateNo of selectedList) {
    if (!templates.value.includes(templateNo)) {
      return true
    }
  }
  return false
})
const localModel = computed({
  get() {
    return attrs.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

/**
 * 查询请求头模板下的所有请求头
 */
const queryHttpHeaders = () => {
  HeadersService.queryHttpHeaders({ templates: [...localModel.value] }).then((response) => {
    rows.value = response.result
  })
}

/**
 * 选择变更事件
 */
const handleChange = () => {
  nextTick(() => {
    if (!showDetails.value) return
    queryHttpHeaders()
  })
}

/**
 * 显示请求头模板内的所有请求头
 */
const showHeaders = () => {
  queryHttpHeaders()
  showDetails.value = true
}
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  user-select: none;
  padding: 5px 10px;
}
</style>

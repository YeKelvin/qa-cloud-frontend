<template>
  <div class="manager-container">
    <!-- 过滤 -->
    <span style="padding: 10px">
      <el-input v-model="filterText" placeholder="搜索模板" size="large" clearable>
        <!-- 新增请求头模板 -->
        <template #prepend>
          <el-button type="primary" link :icon="Plus" style="padding: 6px 20px" @click="createTemplate()" />
        </template>
      </el-input>
    </span>

    <!-- 变量集列表 -->
    <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
      <HttpheaderTemplateTree ref="templateTreeRef" />
    </el-scrollbar>
  </div>
</template>

<script lang="jsx" setup>
import * as HeadersService from '@/api/script/headers'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'
import NameInput from '@/pymeter/components/editor-aside/common/NameInput.vue'
import HttpheaderTemplateTree from './HttpheaderTemplateTree.vue'

const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

const templateTreeRef = ref()
const filterText = ref('')

watch(filterText, (val) => {
  templateTreeRef.value.filter(val)
})

onMounted(() => {
  queryHttpheaderTemplateAll()
})

/**
 * 打开请求头模板
 */
const openHttpheaderTemplate = (templateNo, templateName) => {
  pymeterStore.addTab({
    editorNo: templateNo,
    editorName: templateName,
    editorComponent: 'HttpHeadersTemplate',
    editorMode: 'QUERY'
  })
}

/**
 * 查询所有请求头模板
 */
const queryHttpheaderTemplateAll = () => {
  pymeterStore.queryHttpheaderTemplateAll()
  if (workspaceStore.workspaceScope === 'PRIVATE') {
    pymeterStore.queryHttpheaderTemplateAllInPrivate()
  }
}

/**
 * 新增请求头模板
 */
const createTemplate = async () => {
  let templateName = ''
  // 弹出名称对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '新增请求头模板',
    message: <NameInput onUpdate:modelValue={(val) => (templateName = val)} />,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  if (templateName === '') {
    ElMessage({ message: '名称不能为空', type: 'error', duration: 2 * 1000 })
    return
  }
  // 修改请求头模板
  const response = await HeadersService.createHttpheaderTemplate({
    workspaceNo: workspaceStore.workspaceNo,
    templateName: templateName
  })
  // 重新查询列表
  queryHttpheaderTemplateAll()
  // 打开新增请求头模板的 Tab
  openHttpheaderTemplate(response.result.templateNo, templateName)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
}
</script>

<style lang="scss" scoped>
.manager-container {
  display: flex;
  flex: 1;
  flex-direction: column;

  height: 100%;
  width: 100%;

  .el-divider--horizontal {
    width: 95%;
    margin: 5px 10px;
  }
}

:deep(.el-input-group__prepend button.el-button) {
  border-color: transparent;
  background-color: transparent;
  color: #409eff;
  border-top: 0;
  border-bottom: 0;
}

:deep(.el-input-group__prepend) {
  background-color: #fff;
}

:deep(.el-divider--horizontal) {
  margin: 20px 0;
}

:deep(.el-divider__text) {
  color: #606266;
  user-select: none;
}
</style>

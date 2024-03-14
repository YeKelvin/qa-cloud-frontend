<template>
  <div>
    <div class="flexbox-between" style="margin-bottom: 20px">
      <el-input v-model="filteredText" :prefix-icon="Search" style="width: 300px" placeholder="搜索模板" clearable />
      <el-button type="primary" :icon="Plus" @click="createTemplate()">新增</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="filteredData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
      <!-- 空数据提示 -->
      <template #empty><a-empty /></template>
      <!-- 列定义 -->
      <el-table-column prop="templateName" label="模板名称" />
      <el-table-column prop="templateDesc" label="模板描述" />
      <el-table-column
        prop="createdTime"
        label="创建时间"
        min-width="180"
        width="180"
        sortable
        :sort-method="(a, b) => a.createdTime.localeCompare(b.createdTime)"
      >
        <template #default="{ row }">
          {{ row.createdTime ? dayjs(row.createdTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="updatedTime"
        label="更新时间"
        min-width="180"
        width="180"
        sortable
        :sort-method="(a, b) => a.updatedTime.localeCompare(b.updatedTime)"
      >
        <template #default="{ row }">
          {{ row.updatedTime ? dayjs(row.updatedTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="260" min-width="260">
        <template #default="{ row }">
          <el-button type="primary" link @click="modifyTemplate(row)">编辑</el-button>
          <el-button type="primary" link @click="duplicateTemplate(row)">复制</el-button>
          <el-button type="primary" link @click="cloneTemplate(row)">克隆</el-button>
          <el-button type="primary" link @click="moveTemplate(row)">移动</el-button>
          <el-button type="primary" link @click="removeTemplate(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="jsx" setup>
import * as ElementService from '@/api/script/element'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'
import { useWorkspaceStore } from '@/store/workspace'
import { Plus, Search } from '@element-plus/icons-vue'
import { useQueryClient } from '@tanstack/vue-query'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash-es'

const router = useRouter()
const queryClient = useQueryClient()
const workspaceStore = useWorkspaceStore()
const workspaceNo = computed(() => workspaceStore.workspaceNo)
const templateList = ref([])
const filteredText = ref('')
const filteredData = computed(() => {
  const filterKey = filteredText.value
  if (isEmpty(filterKey)) return templateList.value
  return templateList.value.filter((item) => item.templateName && item.templateName.indexOf(filterKey.trim()) !== -1)
})

onMounted(() => {
  query()
})

watch(
  () => workspaceStore.workspaceNo,
  () => query()
)

/**
 * 查询请求头模板列表
 */
const query = async () => {
  const response = await ElementService.queryHTTPHeaderTemplateAll({ workspaceNo: workspaceStore.workspaceNo })
  templateList.value = response.data
}

/**
 * 新增请求头模板
 */
const createTemplate = () => {
  router.replace({ query: { item: 'httpheader-template' } })
}

/**
 * 编辑请求头模板
 */
const modifyTemplate = ({ templateNo }) => {
  router.replace({ query: { item: 'httpheader-template', templateNo: templateNo } })
}

/**
 * 复制请求头模板
 */
const duplicateTemplate = async ({ templateNo, templateName }) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
        是否确定复制 <b style="font-size: 16px">{templateName}</b> ？
      </span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制请求头模板
  await ElementService.duplicateElement({ elementNo: templateNo })
  // 删除缓存
  await queryClient.cancelQueries({ queryKey: ['HTTPHeaderTemplate', workspaceNo] })
  await queryClient.invalidateQueries({ queryKey: ['HTTPHeaderTemplate', workspaceNo] })
  //  重新查询列表
  query()
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制请求头模板到指定空间
 */
const cloneTemplate = async ({ templateNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={templateNo}
        data={workspaceStore.workspaceList.filter((item) => item.workspaceNo !== workspaceStore.workspaceNo)}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制请求头模板到指定空间
  await ElementService.copyElementToWorkspace({
    workspaceNo: workspaceNo,
    elementNo: templateNo
  })
  // 删除缓存
  await queryClient.cancelQueries({ queryKey: ['HTTPHeaderTemplate', workspaceNo] })
  await queryClient.invalidateQueries({ queryKey: ['HTTPHeaderTemplate', workspaceNo] })
  //  成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 移动请求头模板到指定空间
 */
const moveTemplate = async ({ templateNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={templateNo}
        data={workspaceStore.workspaceList.filter((item) => item.workspaceNo !== workspaceStore.workspaceNo)}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 移动请求头模板到指定空间
  await ElementService.moveElementToWorkspace({
    workspaceNo: workspaceNo,
    elementNo: templateNo
  })
  // 删除缓存
  await queryClient.cancelQueries({ queryKey: ['HTTPHeaderTemplate', workspaceNo] })
  await queryClient.invalidateQueries({ queryKey: ['HTTPHeaderTemplate', workspaceNo] })
  // 重新查询列表
  query()
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 删除请求头模板
 */
const removeTemplate = async ({ templateNo, templateName }) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
        是否确定删除 <b style="font-size: 16px">{templateName}</b> ？
      </span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除请求头模板
  await ElementService.removeElement({ elementNo: templateNo })
  // 删除缓存
  await queryClient.cancelQueries({ queryKey: ['HTTPHeaderTemplate', workspaceNo] })
  await queryClient.invalidateQueries({ queryKey: ['HTTPHeaderTemplate', workspaceNo] })
  // 重新查询列表
  query()
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 1 * 1000 })
}
</script>

<style lang="scss" scoped>
:deep(.arco-empty-image) {
  padding-top: 20px;
}
</style>

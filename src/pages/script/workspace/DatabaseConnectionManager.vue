<template>
  <div>
    <div class="flexbox-between" style="margin-bottom: 20px">
      <el-input v-model="filteredText" :prefix-icon="Search" style="width: 300px" placeholder="搜索数据库" clearable />
      <el-button type="primary" :icon="Plus" @click="createDatabase()">新增</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="filteredData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
      <!-- 空数据提示 -->
      <template #empty><a-empty /></template>
      <!-- 列定义 -->
      <el-table-column prop="databaseName" label="数据库名称" />
      <el-table-column prop="databaseType" label="数据库类型" />
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
          <el-button type="primary" link @click="modifyDatabase(row)">编辑</el-button>
          <el-button type="primary" link @click="duplicateDatabase(row)">复制</el-button>
          <el-button type="primary" link @click="cloneDatabase(row)">克隆</el-button>
          <el-button type="primary" link @click="moveDatabase(row)">移动</el-button>
          <el-button type="danger" link @click="removeDatabase(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="jsx" setup>
import { Plus, Search } from '@element-plus/icons-vue'
import { useQueryClient } from '@tanstack/vue-query'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash-es'

import * as ElementService from '@/api/script/element'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'
import { useWorkspaceStore } from '@/store/workspace'

const router = useRouter()
const queryClient = useQueryClient()
const workspaceStore = useWorkspaceStore()
const workspaceNo = computed(() => workspaceStore.workspaceNo)
const databaseList = ref([])
const filteredText = ref('')
const filteredData = computed(() => {
  const filterKey = filteredText.value
  if (isEmpty(filterKey)) return databaseList.value
  return databaseList.value.filter(item => item.databaseName && item.databaseName.includes(filterKey.trim()))
})

onMounted(() => {
  query()
})

watch(
  () => workspaceStore.workspaceNo,
  () => query()
)

/**
 * 查询数据库连接列表
 */
const query = () => {
  ElementService.queryDatabaseEngineAll({ workspaceNo: workspaceStore.workspaceNo }).then(response => {
    databaseList.value = response.data
  })
}

/**
 * 新增数据库连接
 */
const createDatabase = () => {
  router.replace({ query: { item: 'database-connection' } })
}

/**
 * 编辑数据库连接
 */
const modifyDatabase = ({ databaseNo }) => {
  router.replace({ query: { item: 'database-connection', databaseNo: databaseNo } })
}

/**
 * 复制数据库连接
 */
const duplicateDatabase = async ({ databaseNo, databaseName }) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
        是否确定复制 <b style="font-size: 16px">{databaseName}</b> ？
      </span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制数据库连接
  await ElementService.duplicateElement({ elementNo: databaseNo })
  // 删除缓存
  await queryClient.cancelQueries({ queryKey: ['DatabaseEngine', workspaceNo] })
  await queryClient.invalidateQueries({ queryKey: ['DatabaseEngine', workspaceNo] })
  //  重新查询列表
  query()
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制数据库连接到指定空间
 */
const cloneDatabase = async ({ databaseNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={databaseNo}
        data={workspaceStore.workspaceList.filter(item => item.workspaceNo !== workspaceStore.workspaceNo)}
        onNodeClick={data => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确 定',
    cancelButtonText: '取 消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制数据库连接到指定空间
  await ElementService.copyElementToWorkspace({
    workspaceNo: workspaceNo,
    elementNo: databaseNo
  })
  // 删除缓存
  await queryClient.cancelQueries({ queryKey: ['DatabaseEngine', workspaceNo] })
  await queryClient.invalidateQueries({ queryKey: ['DatabaseEngine', workspaceNo] })
  //  成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 移动数据库连接到指定空间
 */
const moveDatabase = async ({ databaseNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={databaseNo}
        data={workspaceStore.workspaceList.filter(item => item.workspaceNo !== workspaceStore.workspaceNo)}
        onNodeClick={data => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确 定',
    cancelButtonText: '取 消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 移动数据库连接到指定空间
  await ElementService.moveElementToWorkspace({
    workspaceNo: workspaceNo,
    elementNo: databaseNo
  })
  // 删除缓存
  await queryClient.cancelQueries({ queryKey: ['DatabaseEngine', workspaceNo] })
  await queryClient.invalidateQueries({ queryKey: ['DatabaseEngine', workspaceNo] })
  // 重新查询列表
  query()
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 删除数据库连接
 */
const removeDatabase = async ({ databaseNo, databaseName }) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'error',
    title: '警告',
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
        是否确定删除 <b style="font-size: 16px">{databaseName}</b> ？
      </span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除数据库连接
  await ElementService.removeElement({ elementNo: databaseNo })
  // 删除缓存
  await queryClient.cancelQueries({ queryKey: ['DatabaseEngine', workspaceNo] })
  await queryClient.invalidateQueries({ queryKey: ['DatabaseEngine', workspaceNo] })
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

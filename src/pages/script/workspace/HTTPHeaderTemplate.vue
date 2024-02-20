<template>
  <div class="httpheader-template">
    <!-- 请求头表格 -->
    <el-table ref="eltableRef" :data="headerList" style="margin-bottom: 20px" fit stripe highlight-current-row>
      <!-- 数据为空时显示添加按钮 -->
      <template #empty><a-empty /></template>

      <!-- 是否启用 -->
      <el-table-column label="启用" align="center" width="80" min-width="80">
        <template #default="{ row, $index }">
          <el-switch
            v-show="headerList.length != $index + 1"
            v-model="row.enabled"
            size="small"
            inline-prompt
            :active-icon="Check"
            :inactive-icon="Close"
          />
        </template>
      </el-table-column>

      <!-- 请求头名称 -->
      <el-table-column label="请求头名称">
        <template #default="{ row }">
          <SimpleTextarea v-model="row.headerName" />
        </template>
      </el-table-column>

      <!-- 请求头的值 -->
      <el-table-column label="请求头内容">
        <template #default="{ row }">
          <SimpleTextarea v-model="row.headerValue" />
        </template>
      </el-table-column>

      <!-- 请求头的值 -->
      <el-table-column label="请求头描述">
        <template #default="{ row }">
          <SimpleTextarea v-model="row.headerDesc" />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" fixed="right" align="center" width="80" min-width="80">
        <template #default="{ row, $index }">
          <!-- 删除请求头按钮 -->
          <el-button
            v-show="headerList.length != $index + 1"
            type="danger"
            link
            :icon="Delete"
            @click="removeHeader(row, $index)"
          />
        </template>
      </el-table-column>
    </el-table>

    <div v-if="creation || edited" class="flexbox-center">
      <el-button type="danger" :icon="Check" @click="save()">保 存</el-button>
      <el-button type="info" :icon="Close" @click="goback()">取 消</el-button>
    </div>
  </div>
</template>

<script setup>
import * as HttpHeaderService from '@/api/script/headers'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'
import { useWorkspaceStore } from '@/store/workspace'
import { toHashCode } from '@/utils/object-util'
import { Check, Close, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce, has, isEmpty } from 'lodash-es'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const hashcode = ref(null)
const templateNo = ref(route.query.templateNo)
const headerList = ref([])
const removeList = ref([])

const edited = computed(() => hashcode.value !== toHashCode(headerList.value))
const creation = computed(() => isEmpty(route.query.templateNo))

onMounted(async () => {
  if (creation.value) {
    autoNewRow()
    return
  }
  query()
})

watch(
  () => workspaceStore.workspaceNo,
  () => goback()
)

watch(
  headerList,
  debounce(() => autoNewRow(), 100),
  { deep: true, flush: 'sync' }
)

/**
 * 查询
 */
const query = () => {
  HttpHeaderService.queryHttpHeadersByTemplate({ templateNo: route.query.templateNo }).then((response) => {
    headerList.value = response.result
    autoNewRow()
    hashcode.value = toHashCode(headerList.value)
  })
}

/**
 * 最后一行不为空时，自动添加一行
 */
const autoNewRow = () => {
  if (isEmpty(headerList.value)) {
    newRow()
  } else {
    const lastRow = headerList.value[headerList.value.length - 1]
    if (!isBlankRow(lastRow)) newRow()
  }
}

/**
 * 新增一行空行
 */
const newRow = () => {
  headerList.value.push({ headerName: '', headerValue: '', headerDesc: '', enabled: true })
}

/**
 * 判断是否为空行
 */
const isBlankRow = (row) => {
  return isEmpty(row.headerName) && isEmpty(row.headerValue) && isEmpty(row.headerDesc)
}

/**
 * 删除请求头
 */
const removeHeader = (row, index) => {
  if (has(row, 'headerNo')) {
    // 存在 headerNo 时，添加至待删除列表中，等待提交时调用批量删除请求头接口
    removeList.value.push(row)
    headerList.value.splice(index, 1)
  } else {
    // 没有 headerNo 时，代表数据库中没有该请求头，直接移出提交列表
    headerList.value.splice(index, 1)
  }
}

/**
 * 返回
 */
const goback = () => {
  router.replace({ query: { item: 'HTTPHeaderTemplateManager' } })
}

/**
 * 删除变量二次确认
 */
const comfirmDeleteHeaders = async (...args) => {
  const msgList = [h('p', null, '是否确定删除以下请求头?')]
  args.forEach((item) => msgList.push(h('p', null, h('b', null, item))))
  return await ElMessageBox.confirm(null, {
    title: '警告',
    message: h('div', null, msgList),
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  })
    .then(() => false)
    .catch(() => true)
}

/**
 * 提交数据
 */
const save = async () => {
  // 手动清空的空行如果存在 headerNo 则加入待删除列表
  headerList.value.filter((row) => isBlankRow(row)).forEach((row) => has(row, 'headerNo') && removeList.value.push(row))

  // 批量删除变量
  if (!isEmpty(removeList.value)) {
    // 二次确认
    const cancelled = await comfirmDeleteHeaders(...removeList.value.map((item) => item.headerName))
    if (cancelled) return
    // 提交删除
    await HttpHeaderService.deleteHttpHeaders({
      templateNo: templateNo.value,
      headers: removeList.value.map((item) => item.headerNo)
    })
    // 清空待删除列表
    removeList.value = []
  }

  // 过滤空行
  const headers = headerList.value.filter((row) => !isBlankRow(row))
  // 提交修改
  !isEmpty(headers) &&
    (await HttpHeaderService.modifyHttpHeaders({ templateNo: templateNo.value, headerList: headers }))
  // 重新查询
  query()
  // 成功提示
  ElMessage({ message: '保存成功', type: 'info', duration: 2 * 1000 })
}
</script>

<style lang="scss" scoped></style>

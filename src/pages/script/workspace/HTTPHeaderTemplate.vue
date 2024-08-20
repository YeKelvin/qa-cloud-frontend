<template>
  <div class="httpheader-template">
    <el-form ref="elformRef" label-width="120px" :model="elementData" :rules="elementRules">
      <!-- 名称 -->
      <el-form-item label="模板名称：" prop="elementName">
        <el-input v-model="elementData.elementName" placeholder="HTTP请求头模板名称" clearable />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="模板描述：" prop="elementDesc">
        <el-input
          v-model="elementData.elementDesc"
          clearable
          type="textarea"
          placeholder="HTTP请求头模板描述"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </el-form-item>
    </el-form>

    <!-- 分割线 -->
    <el-divider />

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
      <el-table-column label="请求头名称" sortable :sort-method="(a, b) => a.name.localeCompare(b.name)">
        <template #default="{ row }">
          <AutosizeTextarea v-model="row.name" />
        </template>
      </el-table-column>

      <!-- 请求头的值 -->
      <el-table-column label="请求头内容">
        <template #default="{ row }">
          <AutosizeTextarea v-model="row.value" />
        </template>
      </el-table-column>

      <!-- 请求头的值 -->
      <el-table-column label="请求头描述">
        <template #default="{ row }">
          <AutosizeTextarea v-model="row.desc" />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" fixed="right" align="center" width="80" min-width="80">
        <template #default="{ $index }">
          <!-- 删除请求头按钮 -->
          <el-button
            v-show="headerList.length != $index + 1"
            type="danger"
            link
            :icon="Delete"
            @click="removeHeader($index)"
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
import { Check, Close, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from 'lodash-es'

import * as ElementService from '@/api/script/element'
import AutosizeTextarea from '@/components/autosize-textarea/AutosizeTextarea.vue'
import { useWorkspaceStore } from '@/store/workspace'
import { toHashCode } from '@/utils/object-util'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const hashcode = ref()
const creation = computed(() => isEmpty(route.query.templateNo))
const elementData = ref({
  elementNo: route.query.templateNo,
  elementName: '',
  elementDesc: '',
  elementType: 'CONFIG',
  elementClass: 'HTTPHeaderTemplate',
  elementAttrs: {
    HTTPHeaderTemplate__headers: []
  },
  elementProps: {}
})
const elementRules = { elementName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }] }

const edited = computed(() => hashcode.value !== toHashCode(elementData.value))
const elformRef = ref()
const headerList = computed({
  get: () => elementData.value.elementAttrs.HTTPHeaderTemplate__headers,
  set: val => (elementData.value.elementAttrs.HTTPHeaderTemplate__headers = val)
})

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
  debounce(() => autoNewRow(), 250),
  { deep: true, flush: 'sync' }
)

/**
 * 查询
 */
const query = () => {
  ElementService.queryElementInfo({ elementNo: elementData.value.elementNo }).then(response => {
    elementData.value = response.data
    autoNewRow()
    hashcode.value = toHashCode(elementData.value)
  })
}

/**
 * 最后一行不为空时，自动添加一行
 */
const autoNewRow = () => {
  if (isEmpty(headerList.value)) {
    newRow()
  } else {
    const lastRow = headerList.value.at(-1)
    if (!isBlankRow(lastRow)) newRow()
  }
}

/**
 * 新增一行空行
 */
const newRow = () => {
  headerList.value.push({ name: '', value: '', desc: '', enabled: true })
}

/**
 * 判断是否为空行
 */
const isBlankRow = row => {
  return isEmpty(row.name) && isEmpty(row.value) && isEmpty(row.desc)
}

/**
 * 删除请求头
 */
const removeHeader = index => {
  headerList.value.splice(index, 1)
}

/**
 * 返回
 */
const goback = () => {
  router.replace({ query: { item: 'httpheader-template-manager' } })
}

/**
 * 修改元素
 */
const modifyElement = async () => {
  // 过滤空行
  headerList.value = headerList.value.filter(row => !isBlankRow(row))
  // 修改元素
  await ElementService.modifyElement(elementData.value)
}

/**
 * 创建元素
 */
const createElement = async () => {
  // 工作空间非空校验
  if (isEmpty(workspaceStore.workspaceNo)) {
    ElMessage({ message: '请先选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  // 过滤空行
  headerList.value = headerList.value.filter(row => !isBlankRow(row))
  // 新增元素
  await ElementService.createElement(elementData.value)
}

/**
 * 提交数据
 */
const save = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 保存元素
  creation.value ? await createElement() : await modifyElement()
  // 成功提示
  ElMessage({ message: '保存成功', type: 'info', duration: 2 * 1000 })
  // 返回列表页
  goback()
}
</script>

<style lang="scss" scoped></style>

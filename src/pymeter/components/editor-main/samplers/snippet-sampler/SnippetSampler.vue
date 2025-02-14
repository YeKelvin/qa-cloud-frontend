<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form ref="elformRef" label-width="120px" :model="elementData" :rules="elementRules">
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <FxInput v-model="elementData.elementName" placeholder="元素名称" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementDesc">
        <FxInput v-model="elementData.elementDesc" placeholder="元素备注" />
      </el-form-item>

      <!-- 片段列表 -->
      <el-form-item label="片段：" prop="elementAttrs.SnippetSampler__snippet_no" class="snippets-item">
        <el-select v-model="snippetNo" placeholder="脚本片段" style="width: 100%" @change="querySnippetInfo()">
          <el-option
            v-for="snippet in snippetList"
            :key="snippet.elementNo"
            :label="snippet.elementName"
            :value="snippet.elementNo"
          />
        </el-select>
        <!-- 运行按钮 -->
        <template v-if="!isEmpty(snippetNo)">
          <el-dropdown
            split-button
            type="primary"
            trigger="click"
            placement="bottom-end"
            style="margin-left: 10px"
            @click="sendRequest()"
          >
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
            <span>运 行</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="runAll()">
                  <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
                  <span>完整运行</span>
                </el-dropdown-item>
                <el-dropdown-item @click="runTestCase()">
                  <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
                  <span>用例运行</span>
                </el-dropdown-item>
                <el-dropdown-item @click="openTestSnippet()">
                  <el-icon style="font-size: 18px"><View /></el-icon>
                  <span>打开片段</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-form-item>

      <!-- 标签栏 -->
      <div style="display: flex; align-items: center; justify-content: space-between">
        <!-- 标签页头 -->
        <el-tabs v-model="activeTabName" style="width: 100%">
          <el-tab-pane name="PARAMS">
            <template #label>
              <el-badge :hidden="isEmpty(argumentData)" type="success" is-dot>请求参数</el-badge>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 请求参数 -->
      <div v-if="showParams">
        <!-- 形参 -->
        <ArgumentTable
          v-model:use-default="elementData.elementAttrs.SnippetSampler__use_default"
          :data="argumentData"
        />
      </div>
    </el-form>

    <!-- 操作按钮 -->
    <el-affix target=".pymeter-component-container" position="bottom" :offset="60">
      <div class="flexbox-center">
        <template v-if="creation || unsaved">
          <el-tooltip effect="light" placement="top" :content="shortcutKeyName">
            <el-button type="danger" @click="save()">
              <SvgIcon icon-name="pymeter-save" style="margin-right: 5px; font-size: 22px" />
              <span>保 存</span>
            </el-button>
          </el-tooltip>
        </template>
      </div>
    </el-affix>
  </div>
</template>

<script setup>
import { View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from 'lodash-es'

import ArgumentTable from './SnippetSamplerArgumentTable.vue'

import * as ElementService from '@/api/script/element'
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { usePyMeterStore } from '@/store/pymeter'
import { usePyMeterDB } from '@/store/pymeter-db'
import { useWorkspaceStore } from '@/store/workspace'
import { toHashCode } from '@/utils/object-util'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()
const { runSampler, runOffline, runWorkerBySampler } = useRunnableElement()
const { assignElement, assignMetadata } = useElement()
const { unsaved, metadata, creation, localkey, shortcutKeyName, updateTabName, expandParentNode, refreshElementTree } =
  useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: '片段请求',
  elementDesc: '',
  elementType: 'SAMPLER',
  elementClass: 'SnippetSampler',
  elementAttrs: {
    SnippetSampler__snippet_no: '',
    SnippetSampler__arguments: [],
    SnippetSampler__use_default: false
  },
  elementProps: {}
})
const elementRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'elementAttrs.SnippetSampler__snippet_no': [{ required: true, message: '片段不能为空', trigger: 'blur' }]
}
const snippetNo = computed({
  get: () => elementData.value.elementAttrs.SnippetSampler__snippet_no,
  set: val => (elementData.value.elementAttrs.SnippetSampler__snippet_no = val)
})
const argumentData = computed({
  get: () => elementData.value.elementAttrs.SnippetSampler__arguments,
  set: val => (elementData.value.elementAttrs.SnippetSampler__arguments = val)
})
const elformRef = ref()
const snippetList = ref([])
const activeTabName = ref('PARAMS')
const showParams = computed(() => activeTabName.value === 'PARAMS')

watch(
  elementData,
  debounce(localdata => {
    // 如果前后端数据一致则代表数据未更改
    if (metadata.value.hashcode === toHashCode(localdata)) {
      // 数据一致则表示数据未变更
      unsaved.value = false
      // 数据未变更，移除离线数据
      offlineDB.removeItem(localkey.value)
      return
    }
    // 标记数据未保存
    unsaved.value = true
    // 存储离线数据
    offlineDB.setItem(localkey.value, JSON.parse(JSON.stringify({ data: localdata, meta: metadata.value })))
  }, 250),
  { deep: true, flush: 'sync' }
)

onMounted(async () => {
  // 查询空间下所有可用的片段
  queryTestSnippetAll()
  // 优先查询离线数据
  if (unsaved.value) {
    queryOfflineData()
    return
  }
  // 新增模式计算HashCode并存储
  if (creation.value) {
    metadata.value.hashcode = toHashCode(elementData.value)
    return
  }
  // 最后才查询后端数据
  queryBackendData()
})

/**
 * 查询离线数据
 */
const queryOfflineData = async () => {
  const offline = await offlineDB.getItem(localkey.value)
  assignElement(elementData.value, offline.data)
  assignMetadata(metadata.value, offline.meta)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  const response = await ElementService.queryElementInfo({ elementNo: elementData.value.elementNo })
  assignElement(elementData.value, response.data)
  await querySnippetInfo()
  assignMetadata(metadata.value, { hashcode: toHashCode(elementData.value) })
}

/**
 * 查询所有片段
 */
const queryTestSnippetAll = async () => {
  const response = await ElementService.queryElementAll({
    workspaceNo: workspaceStore.workspaceNo,
    elementType: 'SNIPPET',
    elementClass: 'TestSnippet'
  })
  snippetList.value = response.data
}

/**
 * 根据元素编号查询片段详情
 */
const querySnippetInfo = async () => {
  const snippetNo = elementData.value.elementAttrs.SnippetSampler__snippet_no
  if (!snippetNo) return
  argumentData.value = []
  const response = await ElementService.queryElementInfo({ elementNo: snippetNo })
  const parameters = response.data.elementAttrs.TestSnippet__parameters
  if (creation.value) {
    for (const item of parameters) {
      argumentData.value.push({
        name: item.name,
        value: item.default,
        desc: item.desc,
        default: item.default
      })
    }
  } else {
    const argumentList = elementData.value.elementAttrs.SnippetSampler__arguments
    for (const item of parameters) {
      const arg = argumentList.find(i => i.name === item.name)
      argumentData.value.push({
        name: item.name,
        value: arg ? arg.value : item.default,
        desc: item.desc,
        default: item.default
      })
    }
  }
}

/**
 * 在侧边栏打开指定的片段集合
 */
const openTestSnippet = () => {
  const snippet = snippetList.value.filter(
    item => item.elementNo === elementData.value.elementAttrs.SnippetSampler__snippet_no
  )
  // 判断所选片段是否属于当前空间
  if (snippet.workspaceNo && snippet.workspaceNo !== workspaceStore.workspaceNo) {
    ElMessage({ message: '片段不属于当前空间下，请前往所属空间下查看', type: 'warning', duration: 2 * 1000 })
    return
  }
  // 脚本列表打开片段脚本
  pymeterStore.openScript(elementData.value.elementAttrs.SnippetSampler__snippet_no)
  // 滚动至底部
  pymeterStore.scrollToElementTreeBottom()
}

/**
 * 运行元素
 */
const sendRequest = () => {
  if (creation.value) {
    runOffline(metadata.value.rootNo, metadata.value.parentNo, props.editorNo, { aloneness: true })
  } else {
    runSampler(metadata.value.rootNo, elementData.value.elementNo)
  }
}

/**
 * 完整运行
 */
const runAll = () => {
  if (creation.value) {
    runOffline(metadata.value.rootNo, metadata.value.parentNo, props.editorNo, { aloneness: false })
  } else {
    runSampler(metadata.value.rootNo, elementData.value.elementNo, { aloneness: false })
  }
}

/**
 * 用例运行
 */
const runTestCase = () => {
  if (creation.value) {
    runOffline(metadata.value.rootNo, metadata.value.parentNo, props.editorNo)
  } else {
    runWorkerBySampler(metadata.value.rootNo, elementData.value.elementNo)
  }
}

// 校验参数值是否为空
const checkArguments = () => {
  const args = argumentData.value
  for (const arg of args) {
    if (isEmpty(arg.value)) return true
  }
  return false
}

const getSubmitData = () => {
  const submitData = { ...elementData.value }
  submitData.elementAttrs.SnippetSampler__arguments = argumentData.value.map(arg => ({
    name: arg.name,
    value: arg.value
  }))
  return submitData
}

/**
 * 修改元素
 */
const modifyElement = async () => {
  // 修改元素
  await ElementService.modifyElement(getSubmitData())
}

/**
 * 新增元素
 */
const createElement = async () => {
  // 新增元素
  const response = await ElementService.createElementChild({
    rootNo: props.metadata.rootNo,
    parentNo: props.metadata.parentNo,
    ...getSubmitData()
  })
  // 提取元素编号
  const elementNo = response.data.elementNo
  // 移除离线数据
  offlineDB.removeItem(props.editorNo)
  // 更新Tab序列号
  metadata.value.sn = elementNo
  // 更新元素编号
  elementData.value.elementNo = elementNo
  // 展开父节点
  expandParentNode()
}

/**
 * 提交数据
 */
const save = async () => {
  let error
  // 表单校验
  error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  error = checkArguments()
  if (error) {
    ElMessage({ message: '参数值不能为空', type: 'error', duration: 2 * 1000 })
    return
  }
  // 保存元素
  creation.value ? await createElement() : await modifyElement()
  // 标记数据已保存
  unsaved.value = false
  // 更新HashCode
  metadata.value.hashcode = toHashCode(elementData.value)
  // 移除离线数据
  offlineDB.removeItem(localkey.value)
  // 重新查询侧边栏的元素列表
  refreshElementTree()
  // 更新 tab 标题
  updateTabName(elementData.value.elementName)
  // 成功提示
  ElMessage({ message: '保存成功', type: 'info', duration: 2 * 1000 })
}

defineExpose({
  save
})
</script>

<style lang="scss" scoped>
.snippets-item {
  :deep(.el-form-item__content) {
    flex-wrap: nowrap;
  }
}

:deep(.el-badge__content) {
  top: 8px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}

:deep(.el-button-group) {
  display: flex;
}
</style>

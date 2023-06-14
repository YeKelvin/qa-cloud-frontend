<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="120px"
      inline-message
      :model="elementInfo"
      :rules="elementFormRules"
    >
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <el-input v-model="elementInfo.elementName" placeholder="元素名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementRemark">
        <el-input v-model="elementInfo.elementRemark" placeholder="元素备注" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 片段列表 -->
      <el-form-item label="片段引用：" prop="attributes.snippet_no" class="snippets-item">
        <el-select
          v-model="elementInfo.attributes.snippet_no"
          placeholder="脚本片段"
          style="width: 100%"
          :disabled="queryMode"
        >
          <!-- 个人空间时显示所有能访问空间下的片段 -->
          <template v-if="workspaceStore.workspaceScope === 'PRIVATE'">
            <el-option
              v-for="snippet in snippetListInPrivate"
              :key="snippet.elementNo"
              :label="snippet.elementName + ' ( ' + snippet.workspaceName + ' )'"
              :value="snippet.elementNo"
            >
              <span style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ snippet.elementName }}</span>
                <el-tag type="info" size="small" disable-transitions>{{ snippet.workspaceName }}</el-tag>
              </span>
            </el-option>
          </template>
          <!-- 非个人空间时仅显示当前空间下的片段 -->
          <template v-else>
            <el-option
              v-for="snippet in snippetList"
              :key="snippet.elementNo"
              :label="snippet.elementName"
              :value="snippet.elementNo"
            />
          </template>
        </el-select>
        <el-button
          v-show="!isBlank(elementInfo.attributes.snippet_no)"
          style="margin-left: 10px"
          type="primary"
          plain
          :icon="View"
          @click="openSnippetCollection()"
        >
          查 看
        </el-button>
      </el-form-item>

      <!-- 变更警告 -->
      <template v-if="showWarning && !elementInfo.attributes.use_default">
        <el-tag type="danger" style="margin-bottom: 10px" disable-transitions>
          重要提醒：片段参数定义已发生变更，请重新编辑
        </el-tag>
      </template>

      <!-- 标签栏 -->
      <div style="display: flex; align-items: center; justify-content: space-between">
        <!-- 标签页头 -->
        <el-tabs v-model="activeTabName" style="width: 100%">
          <el-tab-pane name="PARAMS">
            <template #label>
              <el-badge :hidden="isEmpty(argumentsData)" type="success" is-dot>请求参数</el-badge>
            </template>
          </el-tab-pane>
        </el-tabs>
        <!-- 运行按钮 -->
        <el-button v-show="queryMode" type="danger" style="margin-left: 10px" @click="executeSampler(elementNo)">
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
          运 行
        </el-button>
      </div>

      <!-- 请求参数 -->
      <div v-if="showParams">
        <!-- 形参 -->
        <ArgumentTable
          v-model:use-default="elementInfo.attributes.use_default"
          :data="argumentsData"
          :edit-mode="editMode"
        />
      </div>

      <!-- 操作按钮 -->
      <el-affix target=".pymeter-component-container" position="bottom" :offset="60">
        <el-form-item v-if="queryMode">
          <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
          <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        </el-form-item>
        <el-form-item v-else-if="modifyMode">
          <el-button :icon="Check" type="danger" @click="modifyElement()">保 存</el-button>
          <el-button :icon="Check" @click="modifyElement(true)">保存并关闭</el-button>
          <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        </el-form-item>
        <el-form-item v-else-if="createMode">
          <el-button :icon="Check" type="primary" @click="createElement()">保 存</el-button>
          <el-button :icon="Check" @click="createElement(true)">保存并关闭</el-button>
          <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        </el-form-item>
      </el-affix>
    </el-form>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import { isBlank } from '@/utils/string-util'
import { isEmpty, differenceBy } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit, View } from '@element-plus/icons-vue'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import EditorProps from '@/pymeter/composables/editor.props'
import ArgumentTable from './SnippetSamplerArgumentTable.vue'

const elementFormRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'attributes.snippet_no': [{ required: true, message: '片段不能为空', trigger: 'blur' }]
}

const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()
const { assignElement } = useElement()
const { executeSampler } = useRunnableElement()
const {
  editMode,
  queryMode,
  modifyMode,
  createMode,
  functions,
  editNow,
  setReadonly,
  updateTab,
  closeTab,
  expandParentNode,
  refreshElementTree
} = useEditor(props)
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
  elementNo: '',
  elementName: 'Snippet请求',
  elementRemark: '',
  elementType: 'SAMPLER',
  elementClass: 'SnippetSampler',
  property: {},
  attributes: {
    arguments: [],
    snippet_no: '',
    use_default: false
  }
})
const activeTabName = ref('PARAMS')
const snippetList = ref([])
const snippetListInPrivate = ref([])
const argumentsData = ref([])
const showWarning = ref(false)
const showParams = computed(() => activeTabName.value === 'PARAMS')

watch(
  () => elementInfo.value.attributes.snippet_no,
  (val) => {
    if (!val) return
    // 清空原有的参数
    argumentsData.value = []
    // 查询选中的片段信息
    querySnippet(val)
  }
)

onMounted(() => {
  querySnippets()
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    assignElement(elementInfo.value, response.result)
  })
})

/**
 * 根据工作空间编号查询所有片段
 */
const querySnippets = () => {
  if (workspaceStore.workspaceScope === 'PRIVATE') {
    ElementService.queryElementAllInPrivate({
      elementType: 'COLLECTION',
      elementClass: 'SnippetCollection'
    }).then((response) => {
      snippetListInPrivate.value = response.result
    })
  } else {
    ElementService.queryElementAll({
      workspaceNo: props.metadata.workspaceNo,
      elementType: 'COLLECTION',
      elementClass: 'SnippetCollection'
    }).then((response) => {
      snippetList.value = response.result
    })
  }
}

/**
 * 根据元素编号查询片段详情
 */
const querySnippet = (snippetNo) => {
  ElementService.queryElementInfo({ elementNo: snippetNo }).then((response) => {
    // 将片段参数定义添加至表格
    response.result.attributes.parameters.forEach((item) => {
      argumentsData.value.push({
        name: item.name,
        value: item.default,
        desc: item.desc,
        default: item.default
      })
    })
    // 非新增模式下，将请求参数合并至表格中，如果请求参数不在片段参数定义中，则丢弃
    const attributes = elementInfo.value.attributes
    if (!createMode.value) {
      argumentsData.value.forEach((item) => {
        const arg = attributes.arguments.find((i) => i.name === item.name)
        if (arg) {
          item.value = arg.value
        }
      })
    }
    // 将请求参数合并至表格中，如果片段参数定义（对称差集）有变更，则给出提示
    if (queryMode.value) {
      if (argumentsData.value.length !== attributes.arguments.length) {
        showWarning.value = true
      }
      const leftDiff = differenceBy(argumentsData.value, attributes.arguments, 'name')
      const rightDiff = differenceBy(attributes.arguments, argumentsData.value, 'name')
      if (leftDiff.length > 0 || rightDiff.length > 0) {
        showWarning.value = true
      }
    }
  })
}

/**
 * 在侧边栏打开指定的片段集合
 */
const openSnippetCollection = () => {
  const snippet = snippetListInPrivate.value.filter(
    (item) => item.elementNo === elementInfo.value.attributes.snippet_no
  )
  // 判断所选片段是否属于当前空间
  if (snippet.workspaceNo && snippet.workspaceNo !== workspaceStore.workspaceNo) {
    ElMessage({ message: '片段不属于当前空间下，请前往所属空间下查看', type: 'warning', duration: 2 * 1000 })
    return
  }
  // 脚本列表打开片段脚本
  pymeterStore.addSelectedCollection(elementInfo.value.attributes.snippet_no)
  // 滚动至底部
  pymeterStore.scrollToElementTreeBottom()
}

// 校验参数值是否为空
const checkParameter = () => {
  let pass = true
  elementInfo.value.attributes.arguments.forEach((item) => {
    if (isBlank(item.value)) {
      pass = false
      return
    }
  })
  if (!pass) ElMessage({ message: '参数值不能为空', type: 'error' })
  return pass
}

// 设置元素属性
const setElementProperty = () => {
  if (elementInfo.value.attributes.use_default) return
  elementInfo.value.attributes.arguments = argumentsData.value.map((item) => ({
    name: item.name,
    value: item.value
  }))
}

/**
 * 更新元素编号
 */
const updateElementNo = (val) => {
  elementNo.value = val
  elementInfo.value.elementNo = val
}

/**
 * 修改元素
 */
const modifyElement = async (close = false) => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 设置元素属性
  setElementProperty()
  // 校验参数
  if (!checkParameter()) return
  // 修改元素
  await ElementService.modifyElement({ elementNo: elementNo.value, ...elementInfo.value })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题
    updateTab(elementInfo.value.elementName)
    // 隐藏警告
    showWarning.value = false
  }
  // 重新查询侧边栏的元素列表
  refreshElementTree()
  // 成功提示
  ElMessage({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
  // 需要关闭 tab
  if (close) {
    closeTab()
  }
}

/**
 * 创建元素
 */
const createElement = async (close = false) => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 设置元素属性
  setElementProperty()
  // 校验参数
  if (!checkParameter()) return
  // 新增元素
  const response = await ElementService.createElementChildren({
    rootNo: props.metadata.rootNo,
    parentNo: props.metadata.parentNo,
    children: [elementInfo.value]
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题和编号
    updateTab(elementInfo.value.elementName, response.result[0])
    // 更新元素编号
    updateElementNo(response.result[0])
  }
  // 展开父节点
  expandParentNode()
  // 重新查询侧边栏的元素列表
  refreshElementTree()
  // 成功提示
  ElMessage({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
  // 需要关闭 tab
  if (close) {
    closeTab()
  }
}

// 暂存函数，给 useEditor 使用
functions.createFn = createElement
functions.modifyFn = modifyElement
</script>

<style lang="scss" scoped>
.snippets-item {
  :deep(.el-form-item__content) {
    flex-wrap: nowrap;
  }
}

:deep(.el-badge__content) {
  top: 10px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

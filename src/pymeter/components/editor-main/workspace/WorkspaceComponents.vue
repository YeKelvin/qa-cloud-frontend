<template>
  <div class="pymeter-component-container" tabindex="-1">
    <!-- 配置 tab -->
    <el-tabs v-model="activeTabName">
      <!-- <el-tab-pane name="Configurator">
        <template #label>
          <el-badge :hidden="_isEmpty(configuratorList)" type="success" is-dot>配置器</el-badge>
        </template>
      </el-tab-pane> -->
      <el-tab-pane name="PreProcessor">
        <template #label>
          <el-badge :hidden="_isEmpty(preProcessorList)" type="success" is-dot>前置处理器</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="PostProcessor">
        <template #label>
          <el-badge :hidden="_isEmpty(postProcessorList)" type="success" is-dot>后置处理器</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="Assertion">
        <template #label>
          <el-badge :hidden="_isEmpty(assertionList)" type="success" is-dot>测试断言器</el-badge>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 前置处理器 -->
    <div v-if="showPreProcessorTab">
      <PreProcessorPane v-model="preProcessorList" :edit-mode="editMode" owner-type="ALL" />
    </div>

    <!-- 后置处理器 -->
    <div v-if="showPostProcessorTab">
      <PostProcessorPane v-model="postProcessorList" :edit-mode="editMode" owner-type="ALL" />
    </div>

    <!-- 测试断言器 -->
    <div v-if="showAssertionTab">
      <AssertionPane v-model="assertionList" :edit-mode="editMode" owner-type="ALL" />
    </div>
  </div>

  <!-- 操作按钮 -->
  <el-affix target=".pymeter-component-container" position="bottom" :offset="60">
    <div class="operation-button">
      <template v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </template>
      <template v-else>
        <el-button :icon="Check" type="danger" @click="saveComponents()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </template>
    </div>
  </el-affix>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import { isEmpty as _isEmpty, assign as _assign } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import useEditor from '@/pymeter/composables/useEditor'
import EditorProps from '@/pymeter/composables/editor.props'
import PreProcessorPane from '@/pymeter/components/editor-main/panes/PreProcessorPane.vue'
import PostProcessorPane from '@/pymeter/components/editor-main/panes/PostProcessorPane.vue'
import AssertionPane from '@/pymeter/components/editor-main/panes/AssertionPane.vue'

const props = defineProps(EditorProps)
const { editMode, queryMode, functions, editNow, setReadonly, closeTab } = useEditor(props)
const workspaceNo = ref(props.editorNo)

const componentList = ref([])
const configuratorList = ref([])
const preProcessorList = ref([])
const postProcessorList = ref([])
const assertionList = ref([])
const pendingSubmitComponentList = computed(() => {
  // 添加 sortNumber 属性
  configuratorList.value.forEach((item, index) => (item.sortNumber = index + 1))
  preProcessorList.value.forEach((item, index) => (item.sortNumber = index + 1))
  postProcessorList.value.forEach((item, index) => (item.sortNumber = index + 1))
  assertionList.value.forEach((item, index) => (item.sortNumber = index + 1))
  return [...configuratorList.value, ...preProcessorList.value, ...postProcessorList.value, ...assertionList.value]
})

const activeTabName = ref('PreProcessor')
const showConfiguratorTab = computed(() => activeTabName.value === 'Configurator')
const showPreProcessorTab = computed(() => activeTabName.value === 'PreProcessor')
const showPostProcessorTab = computed(() => activeTabName.value === 'PostProcessor')
const showAssertionTab = computed(() => activeTabName.value === 'Assertion')

onMounted(() => {
  query()
})

const query = () => {
  ElementService.queryWorkspaceComponents({ workspaceNo: workspaceNo.value }).then((response) => {
    componentList.value = response.result
    componentList.value.forEach((component) => {
      if (component.elementType === 'PRE_PROCESSOR') {
        preProcessorList.value.push(component)
        return true
      }
      if (component.elementType === 'POST_PROCESSOR') {
        postProcessorList.value.push(component)
        return true
      }
      if (component.elementType === 'ASSERTION') {
        assertionList.value.push(component)
        return true
      }
    })
    // 根据 sortNumber 排序
    preProcessorList.value.sort((a, b) => a.sortNumber - b.sortNumber)
    postProcessorList.value.sort((a, b) => a.sortNumber - b.sortNumber)
    assertionList.value.sort((a, b) => a.sortNumber - b.sortNumber)
  })
}

const saveComponents = () => {
  ElementService.setWorkspaceComponents({
    workspaceNo: workspaceNo.value,
    components: pendingSubmitComponentList.value
  }).then(() => {
    ElMessage({ message: '设置成功', type: 'info', duration: 2 * 1000 })
    setReadonly()
  })
}

// 暂存函数，给 useEditor 使用
functions.createFn = saveComponents
functions.modifyFn = saveComponents
</script>

<style lang="scss" scoped>
.operation-button {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

:deep(.el-badge__content) {
  top: 10px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

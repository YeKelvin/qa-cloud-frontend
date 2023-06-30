<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-tabs v-model="activeTabName">
      <el-tab-pane name="SETTINGS">
        <template #label>
          <el-badge :hidden="hiddenSettingsDot" type="success" is-dot>空间设置</el-badge>
        </template>
      </el-tab-pane>
      <!-- <el-tab-pane name="CONFIGURATOR">
        <template #label>
          <el-badge :hidden="isEmpty(configuratorList)" type="success" is-dot>配置器</el-badge>
        </template>
      </el-tab-pane> -->
      <el-tab-pane name="PREV_PROCESSOR">
        <template #label>
          <el-badge :hidden="isEmpty(prevProcessorList)" type="success" is-dot>前置处理器</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="POST_PROCESSOR">
        <template #label>
          <el-badge :hidden="isEmpty(postProcessorList)" type="success" is-dot>后置处理器</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="TEST_ASSERTION">
        <template #label>
          <el-badge :hidden="isEmpty(testAssertionList)" type="success" is-dot>测试断言器</el-badge>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div v-if="showSettingsTab" class="tab-pane">
      <el-form label-position="right" label-width="140px">
        <!-- 倒序执行 -->
        <el-form-item>
          <!-- label -->
          <template #label>
            <div style="display: flex">
              <span>倒序执行组件：</span>
              <!-- tips -->
              <el-tooltip placement="right" effect="light">
                <template #content>
                  <div style="font-size: 14px; color: var(--el-text-color-regular)">
                    <div>- 说明: 根据组件类型指定取样器组件的运行顺序</div>
                    <div>- 包含: 前置处理器、后置处理器、断言器</div>
                    <div>- 正序: 空间 → 集合 → 线程 → 控制器 → 取样器</div>
                    <div>- 倒序: 取样器 → 控制器 → 线程 → 集合 → 空间</div>
                  </div>
                </template>
                <el-button :icon="Warning" style="font-size: 16px" link />
              </el-tooltip>
            </div>
          </template>
          <el-select
            v-model="settings.running_strategy.reverse"
            style="width: 300px"
            multiple
            clearable
            :disabled="queryMode"
          >
            <el-option label="前置" value="PREV" />
            <el-option label="后置" value="POST" />
            <el-option label="断言" value="ASSERT" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 前置处理器 -->
    <div v-if="showPrevProcessorTab" class="tab-pane">
      <PrevProcessorPane v-model="prevProcessorList" :edit-mode="editMode" owner-type="ALL" />
    </div>

    <!-- 后置处理器 -->
    <div v-if="showPostProcessorTab" class="tab-pane">
      <PostProcessorPane v-model="postProcessorList" :edit-mode="editMode" owner-type="ALL" />
    </div>

    <!-- 测试断言器 -->
    <div v-if="showTestAssertionTab" class="tab-pane">
      <TestAssertionPane v-model="testAssertionList" :edit-mode="editMode" owner-type="ALL" />
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
        <el-button :icon="Check" type="danger" @click="save()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </template>
    </div>
  </el-affix>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import TestAssertionPane from '@/pymeter/components/editor-main/panes/AssertionPane.vue'
import PostProcessorPane from '@/pymeter/components/editor-main/panes/PostProcessorPane.vue'
import PrevProcessorPane from '@/pymeter/components/editor-main/panes/PrevProcessorPane.vue'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import { Check, Close, Edit, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isEmpty } from 'lodash-es'

const props = defineProps(EditorProps)
const { editMode, queryMode, functions, editNow, setReadonly, closeTab } = useEditor(props)
const workspaceNo = ref(props.editorNo)
const settings = ref({
  running_strategy: {
    reverse: []
  }
})
const componentList = ref([])
const configuratorList = ref([])
const prevProcessorList = ref([])
const postProcessorList = ref([])
const testAssertionList = ref([])
const pendingSubmitComponentList = computed(() => {
  // 添加 sortNumber 属性
  configuratorList.value.forEach((item, index) => (item.sortNumber = index + 1))
  prevProcessorList.value.forEach((item, index) => (item.sortNumber = index + 1))
  postProcessorList.value.forEach((item, index) => (item.sortNumber = index + 1))
  testAssertionList.value.forEach((item, index) => (item.sortNumber = index + 1))
  return [...configuratorList.value, ...prevProcessorList.value, ...postProcessorList.value, ...testAssertionList.value]
})

const activeTabName = ref('SETTINGS')
const showSettingsTab = computed(() => activeTabName.value === 'SETTINGS')
const showConfiguratorTab = computed(() => activeTabName.value === 'CONFIGURATOR')
const showPrevProcessorTab = computed(() => activeTabName.value === 'PREV_PROCESSOR')
const showPostProcessorTab = computed(() => activeTabName.value === 'POST_PROCESSOR')
const showTestAssertionTab = computed(() => activeTabName.value === 'TEST_ASSERTION')
const hiddenSettingsDot = computed(() => isEmpty(settings.value.running_strategy.reverse))

onMounted(() => {
  query()
})

const query = () => {
  // 查询空间组件
  ElementService.queryWorkspaceComponents({ workspaceNo: workspaceNo.value }).then((response) => {
    componentList.value = response.result
    componentList.value.forEach((component) => {
      if (component.elementType === 'PREV_PROCESSOR') {
        prevProcessorList.value.push(component)
      } else if (component.elementType === 'POST_PROCESSOR') {
        postProcessorList.value.push(component)
      } else if (component.elementType === 'ASSERTION') {
        testAssertionList.value.push(component)
      } else {
        return
      }
    })
    // 根据 sortNumber 排序
    sortComponentList()
  })
  // 查询空间组件设置
  ElementService.queryWorkspaceSettings({ workspaceNo: workspaceNo.value }).then((response) => {
    const result = response.result
    const reverse = result?.running_strategy?.reverse
    if (!isEmpty(reverse)) {
      settings.value.running_strategy.reverse = reverse
    }
  })
}

const sortComponentList = () => {
  // 根据 sortNumber 排序
  prevProcessorList.value.sort((a, b) => a.sortNumber - b.sortNumber)
  postProcessorList.value.sort((a, b) => a.sortNumber - b.sortNumber)
  testAssertionList.value.sort((a, b) => a.sortNumber - b.sortNumber)
}

const save = async () => {
  // 保存空间组件
  await ElementService.setWorkspaceComponents({
    workspaceNo: workspaceNo.value,
    components: pendingSubmitComponentList.value
  })
  // 保存空间设置
  await ElementService.setWorkspaceSettings({
    workspaceNo: workspaceNo.value,
    settings: settings.value
  })
  ElMessage({ message: '设置成功', type: 'info', duration: 2 * 1000 })
  setReadonly()
}

// 暂存函数，给 useEditor 使用
functions.createFn = save
functions.modifyFn = save
</script>

<style lang="scss" scoped>
.tab-pane {
  min-height: 100px;
}

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

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
            v-model="componentData.settingData.running_strategy.reverse"
            style="width: 300px"
            multiple
            clearable
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
      <PrevProcessorPane v-model="componentData.prevProcessorList" edit-mode="MODIFY" owner-type="ALL" />
    </div>

    <!-- 后置处理器 -->
    <div v-if="showPostProcessorTab" class="tab-pane">
      <PostProcessorPane v-model="componentData.postProcessorList" edit-mode="MODIFY" owner-type="ALL" />
    </div>

    <!-- 测试断言器 -->
    <div v-if="showTestAssertionTab" class="tab-pane">
      <TestAssertionPane v-model="componentData.testAssertionList" edit-mode="MODIFY" owner-type="ALL" />
    </div>
  </div>

  <!-- 操作按钮 -->
  <template v-if="unsaved">
    <SaveButton :tips="shortcutKeyName" @click="save()" />
  </template>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import TestAssertionPane from '@/pymeter/components/editor-main/component-panes/TestAssertionPane.vue'
import PostProcessorPane from '@/pymeter/components/editor-main/component-panes/PostProcessorPane.vue'
import PrevProcessorPane from '@/pymeter/components/editor-main/component-panes/PrevProcessorPane.vue'
import EditorProps from '@/pymeter/composables/editor.props'
import EditorEmits from '@/pymeter/composables/editor.emits'
import SaveButton from '@/pymeter/components/editor-main/common/SaveButton.vue'
import useEditor from '@/pymeter/composables/useEditor'
import { Warning } from '@element-plus/icons-vue'
import { usePyMeterDB } from '@/store/pymeter-db'
import { toHashCode } from '@/utils/object-util'
import { ElMessage } from 'element-plus'
import { isEmpty, debounce } from 'lodash-es'

const props = defineProps(EditorProps)
const emit = defineEmits(EditorEmits)
const { unsaved, metadata, localkey, shortcutKeyName } = useEditor()
const offlineDB = usePyMeterDB().offlineDB
const componentData = ref({
  workspaceNo: props.metadata.workspaceNo,
  settingData: {
    running_strategy: {
      reverse: []
    }
  },
  configuratorList: [],
  prevProcessorList: [],
  postProcessorList: [],
  testAssertionList: []
})
const activeTabName = ref('SETTINGS')
const showSettingsTab = computed(() => activeTabName.value === 'SETTINGS')
// const showConfiguratorTab = computed(() => activeTabName.value === 'CONFIGURATOR')
const showPrevProcessorTab = computed(() => activeTabName.value === 'PREV_PROCESSOR')
const showPostProcessorTab = computed(() => activeTabName.value === 'POST_PROCESSOR')
const showTestAssertionTab = computed(() => activeTabName.value === 'TEST_ASSERTION')
const hiddenSettingsDot = computed(() => isEmpty(componentData.value.settingData.running_strategy.reverse))

watch(
  componentData,
  debounce((localdata) => {
    console.log('watch')
    // 如果前后端数据一致则代表数据未更改
    if (metadata.value.hashcode === toHashCode(localdata)) {
      unsaved.value = false
      return
    }
    console.log('存离线')
    // 标记数据未保存
    unsaved.value = true
    // 存储离线数据
    offlineDB.setItem(localkey.value, JSON.parse(JSON.stringify({ data: localdata, meta: metadata.value })))
  }, 500),
  { deep: true, flush: 'sync' }
)

onMounted(async () => {
  // 优先查询离线数据
  if (unsaved.value) {
    queryOfflineData()
  } else {
    // 查询后端数据
    queryBackendData()
  }
})

/**
 * 查询离线数据
 */
const queryOfflineData = async () => {
  const offline = await offlineDB.getItem(localkey.value)
  Object.assign(componentData.value, offline.data)
  Object.assign(metadata.value, offline.meta)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  let response = null
  const prevList = []
  const postList = []
  const testList = []
  // 查询空间组件设置
  response = await ElementService.queryWorkspaceSettings({ workspaceNo: componentData.value.workspaceNo })
  const reverse = response.result?.running_strategy?.reverse
  if (!isEmpty(reverse)) {
    componentData.value.settingData.running_strategy.reverse = reverse
  }
  // 查询空间组件
  response = await ElementService.queryWorkspaceComponents({ workspaceNo: componentData.value.workspaceNo })
  response.result.forEach((component) => {
    if (component.elementType === 'PREV_PROCESSOR') {
      prevList.push(component)
      return
    }
    if (component.elementType === 'POST_PROCESSOR') {
      postList.push(component)
      return
    }
    if (component.elementType === 'ASSERTION') {
      testList.push(component)
      return
    }
  })
  // 根据 elementIndex 排序
  prevList.sort((a, b) => a.elementIndex - b.elementIndex)
  postList.sort((a, b) => a.elementIndex - b.elementIndex)
  testList.sort((a, b) => a.elementIndex - b.elementIndex)
  // 更新页面数据
  componentData.value.prevProcessorList = prevList
  componentData.value.postProcessorList = postList
  componentData.value.testAssertionList = testList
  // 计算HashCode并存储
  Object.assign(metadata.value, { hashcode: toHashCode(componentData.value) })
}

/**
 * 提交数据
 */
const save = async () => {
  // 保存空间组件
  await ElementService.setWorkspaceComponents({
    workspaceNo: componentData.value.workspaceNo,
    componentList: [
      ...componentData.value.configuratorList.value,
      ...componentData.value.prevProcessorList.value,
      ...componentData.value.postProcessorList.value,
      ...componentData.value.testAssertionList.value
    ]
  })
  // 保存空间设置
  await ElementService.setWorkspaceSettings({
    workspaceNo: componentData.value.workspaceNo,
    settings: componentData.value.settingData
  })
  ElMessage({ message: '设置成功', type: 'info', duration: 2 * 1000 })
}

defineExpose({
  save
})
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

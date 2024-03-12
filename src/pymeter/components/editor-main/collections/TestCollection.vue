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

      <!-- 串行执行 -->
      <el-form-item label="串行执行：" prop="elementProps.TestCollection__serialize_workers">
        <el-switch
          v-model="elementData.elementProps.TestCollection__serialize_workers"
          active-value="true"
          inactive-value="false"
          inline-prompt
          :active-icon="Check"
          :inactive-icon="Close"
          :disabled="true"
        />
      </el-form-item>

      <!-- 间隔时间 -->
      <!-- <el-form-item label="间隔时间：" prop="elementProps.TestCollection__delay">
        <FxInput
          v-model="elementData.elementProps.TestCollection__delay"
          placeholder="间隔运行时间"
        >
          <template #append>ms</template>
        </FxInput>
      </el-form-item> -->

      <!-- 配置tab -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="COMPO_SETTINGS">
          <template #label>
            <el-badge :hidden="hiddenCompoSettingsDot" type="success" is-dot>组件设置</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="PREV_PROCESSOR">
          <template #label>
            <el-badge :hidden="isEmpty(elementData.elementCompos.prevList)" type="success" is-dot>前置处理器</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="POST_PROCESSOR">
          <template #label>
            <el-badge :hidden="isEmpty(elementData.elementCompos.postList)" type="success" is-dot>后置处理器</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="TEST_ASSERTION">
          <template #label>
            <el-badge :hidden="isEmpty(elementData.elementCompos.testList)" type="success" is-dot>测试断言器</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 组件设置 -->
      <div v-if="showCompoSettingsTab" class="tab-pane">
        <el-form label-width="140px">
          <!-- 是否排除空间组件 -->
          <el-form-item>
            <!-- label -->
            <template #label>
              <div style="display: flex">
                <span>排除空间组件：</span>
                <!-- tips -->
                <el-tooltip placement="right" effect="light">
                  <template #content>
                    <div style="font-size: 14px; color: var(--el-text-color-regular)">
                      <div>- 解析脚本时不加载空间组件</div>
                      <div>- 空间组件包括: 配置器、前置处理器、后置处理器、测试断言器</div>
                    </div>
                  </template>
                  <el-button :icon="Warning" style="font-size: 16px" link />
                </el-tooltip>
              </div>
            </template>
            <el-switch
              v-model="elementData.elementAttrs.TestCollection__exclude_workspace"
              inline-prompt
              :active-icon="Check"
              :inactive-icon="Close"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
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
              v-model="elementData.elementProps.TestCollection__running_strategy.reverse"
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
        <PrevProcessorPane v-model="elementData.elementCompos.prevList" owner-type="HTTP" />
      </div>

      <!-- 后置处理器 -->
      <div v-if="showPostProcessorTab" class="tab-pane">
        <PostProcessorPane v-model="elementData.elementCompos.postList" owner-type="HTTP" />
      </div>

      <!-- 测试断言器 -->
      <div v-if="showTestAssertionTab" class="tab-pane">
        <TestAssertionPane v-model="elementData.elementCompos.testList" owner-type="HTTP" />
      </div>
    </el-form>

    <!-- 操作按钮 -->
    <el-affix target=".pymeter-component-container" position="bottom" :offset="60">
      <div class="flexbox-center">
        <template v-if="!creation">
          <el-dropdown
            split-button
            type="primary"
            trigger="click"
            placement="bottom-end"
            style="margin-right: 20px"
            @click="runTestCollection(elementData.elementNo)"
          >
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
            <span>运 行</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="queryCollectionScript()">查询脚本</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-if="creation || unsaved">
          <el-tooltip effect="light" placement="top" :content="shortcutKeyName">
            <el-button type="danger" style="width: 120px" @click="save()">
              <SvgIcon icon-name="pymeter-save" style="margin-right: 5px; font-size: 22px" />
              <span>保 存</span>
            </el-button>
          </el-tooltip>
        </template>
      </div>
    </el-affix>

    <!-- JSON脚本 -->
    <el-dialog v-model="showJsonScriptDialog" center title="Json脚本" width="80%">
      <MonacoEditor ref="jsonEditorRef" language="json" style="height: 400px" :readonly="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import PostProcessorPane from '@/pymeter/components/editor-main/components/PostProcessorPane.vue'
import PrevProcessorPane from '@/pymeter/components/editor-main/components/PrevProcessorPane.vue'
import TestAssertionPane from '@/pymeter/components/editor-main/components/TestAssertionPane.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import { usePyMeterStore } from '@/store/pymeter'
import { usePyMeterDB } from '@/store/pymeter-db'
import { useWorkspaceStore } from '@/store/workspace'
import { toHashCode } from '@/utils/object-util'
import { Check, Close, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from 'lodash-es'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()
const { runTestCollection } = useRunnableElement()
const { assignElement, assignMetadata, assignComponent } = useElement()
const { unsaved, metadata, creation, localkey, shortcutKeyName, updateTabName } = useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: '测试集合',
  elementDesc: '',
  elementType: 'COLLECTION',
  elementClass: 'TestCollection',
  elementAttrs: {
    TestCollection__exclude_workspace: false
  },
  elementProps: {
    TestCollection__serialize_workers: 'true',
    TestCollection__delay: '0',
    TestCollection__running_strategy: {
      reverse: []
    }
  },
  elementCompos: {
    confList: [],
    prevList: [],
    postList: [],
    testList: []
  }
})
const elementRules = {
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
}
const excludeWorkspace = computed(() => elementData.value.elementAttrs.TestCollection__exclude_workspace)
const runningReverse = computed(() => elementData.value.elementProps.TestCollection__running_strategy.reverse)

const activeTabName = ref('COMPO_SETTINGS')
const showCompoSettingsTab = computed(() => activeTabName.value === 'COMPO_SETTINGS')
const showPrevProcessorTab = computed(() => activeTabName.value === 'PREV_PROCESSOR')
const showPostProcessorTab = computed(() => activeTabName.value === 'POST_PROCESSOR')
const showTestAssertionTab = computed(() => activeTabName.value === 'TEST_ASSERTION')
const hiddenCompoSettingsDot = computed(() => !excludeWorkspace.value && isEmpty(runningReverse.value))

const elformRef = ref()
const jsonEditorRef = ref()
const showJsonScriptDialog = ref(false)

watch(
  elementData,
  debounce((localdata) => {
    // 添加组件索引
    localdata.elementCompos.prevList.forEach((item, index) => (item.elementIndex = index + 1))
    localdata.elementCompos.postList.forEach((item, index) => (item.elementIndex = index + 1))
    localdata.elementCompos.testList.forEach((item, index) => (item.elementIndex = index + 1))
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
  let response = null
  // 查询元素信息
  response = await ElementService.queryElementInfo({ elementNo: elementData.value.elementNo })
  assignElement(elementData.value, response.data)
  // 查询元素组件
  response = await ElementService.queryElementComponents({ elementNo: elementData.value.elementNo })
  assignComponent(elementData.value, response.data)
  // 计算HashCode并存储
  assignMetadata(metadata.value, { hashcode: toHashCode(elementData.value) })
}

/**
 * 修改元素
 */
const modifyElement = async () => {
  // 修改元素
  await ElementService.modifyElement(elementData.value)
  // 刷新集合列表
  pymeterStore.refreshCollections()
  // 刷新元素列表
  pymeterStore.refreshElementTree()
}

/**
 * 新增元素
 */
const createElement = async () => {
  // 工作空间非空校验
  if (isEmpty(workspaceStore.workspaceNo)) {
    ElMessage({ message: '请先选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  // 新增元素
  const response = await ElementService.createElement(elementData.value)
  // 提取元素编号
  const elementNo = response.data.elementNo
  // 移除离线数据
  offlineDB.removeItem(props.editorNo)
  // 更新Tab序列号
  metadata.value.sn = elementNo
  // 更新元素编号
  elementData.value.elementNo = elementNo
  // 刷新集合列表
  pymeterStore.refreshCollections()
  // 刷新元素列表
  pymeterStore.refreshElementTree()
  // 添加至已选列表中
  pymeterStore.addSelectedCollection(elementNo)
  // 滚动至底部
  pymeterStore.scrollToElementTreeBottom()
}

/**
 * 查看 Json 脚本
 */
const queryCollectionScript = () => {
  ExecutionService.queryCollectionJson({
    collectionNo: elementData.value.elementNo,
    datasets: pymeterStore.selectedDatasets,
    useCurrentValue: pymeterStore.useCurrentValue
  }).then((response) => {
    showJsonScriptDialog.value = true
    nextTick(() => {
      jsonEditorRef.value.setValue(JSON.stringify(response.data))
      setTimeout(() => {
        jsonEditorRef.value.formatDocument()
      }, 200)
    })
  })
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
  // 标记数据已保存
  unsaved.value = false
  // 更新HashCode
  metadata.value.hashcode = toHashCode(elementData.value)
  // 移除离线数据
  offlineDB.removeItem(localkey.value)
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
.tab-pane {
  min-height: 150px;
}

:deep(.el-badge__content) {
  top: 8px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}

:deep(.el-button-group .el-button:first-child) {
  width: 90px;
}
</style>

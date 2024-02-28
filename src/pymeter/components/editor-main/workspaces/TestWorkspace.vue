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
          <el-badge :hidden="isEmpty(elementData.elementCompos.confList)" type="success" is-dot>配置器</el-badge>
        </template>
      </el-tab-pane> -->
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

    <div v-if="showSettingsTab" class="tab-pane">
      <el-form label-position="right" label-width="140px">
        <!-- 倒序执行 -->
        <el-form-item style="padding-top: 10px">
          <!-- label -->
          <template #label>
            <div style="display: flex">
              <span>倒序执行组件：</span>
              <!-- tips -->
              <el-tooltip placement="bottom-start" effect="light">
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
            v-model="elementData.elementAttrs.running_strategy.reverse"
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
      <PrevProcessorPane v-model="elementData.elementCompos.prevList" edit-mode="MODIFY" owner-type="ALL" />
    </div>

    <!-- 后置处理器 -->
    <div v-if="showPostProcessorTab" class="tab-pane">
      <PostProcessorPane v-model="elementData.elementCompos.postList" edit-mode="MODIFY" owner-type="ALL" />
    </div>

    <!-- 测试断言器 -->
    <div v-if="showTestAssertionTab" class="tab-pane">
      <TestAssertionPane v-model="elementData.elementCompos.testList" edit-mode="MODIFY" owner-type="ALL" />
    </div>
  </div>

  <!-- 操作按钮 -->
  <template v-if="unsaved">
    <SaveButton :tips="shortcutKeyName" @click="save()" />
  </template>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import SaveButton from '@/pymeter/components/editor-main/others/SaveButton.vue'
import PostProcessorPane from '@/pymeter/components/editor-main/components/PostProcessorPane.vue'
import PrevProcessorPane from '@/pymeter/components/editor-main/components/PrevProcessorPane.vue'
import TestAssertionPane from '@/pymeter/components/editor-main/components/TestAssertionPane.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import { usePyMeterDB } from '@/store/pymeter-db'
import { toHashCode } from '@/utils/object-util'
import { Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from 'lodash-es'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const { unsaved, metadata, localkey, shortcutKeyName } = useEditor()
const { assignElement, assignMetadata, assignComponent } = useElement()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: '空间元素',
  elementDesc: '',
  elementType: 'WORKSPACE',
  elementClass: 'TestWorkspace',
  elementAttrs: {
    running_strategy: {
      reverse: []
    }
  },
  elementProps: {},
  elementCompos: {
    confList: [],
    prevList: [],
    postList: [],
    testList: []
  }
})
const activeTabName = ref('SETTINGS')
const showSettingsTab = computed(() => activeTabName.value === 'SETTINGS')
// const showConfiguratorTab = computed(() => activeTabName.value === 'CONFIGURATOR')
const showPrevProcessorTab = computed(() => activeTabName.value === 'PREV_PROCESSOR')
const showPostProcessorTab = computed(() => activeTabName.value === 'POST_PROCESSOR')
const showTestAssertionTab = computed(() => activeTabName.value === 'TEST_ASSERTION')
const hiddenSettingsDot = computed(() => isEmpty(elementData.value.elementAttrs.running_strategy.reverse))

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
  if (unsaved.value) {
    // 查询离线数据
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
  assignElement(elementData.value, offline.data)
  assignMetadata(metadata.value, offline.meta)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  let response = null
  // 查询空间元素信息
  response = await ElementService.queryElementInfo({ elementNo: elementData.value.elementNo })
  assignElement(elementData.value, response.data)
  // 查询空间元素组件
  response = await ElementService.queryElementComponents({ elementNo: elementData.value.elementNo })
  assignComponent(elementData.value, response.data)
  // 计算HashCode并存储
  assignMetadata(metadata.value, { hashcode: toHashCode(elementData.value) })
}

/**
 * 提交数据
 */
const save = async () => {
  // 保存空间组件
  await ElementService.modifyElement(elementData.value)
  // 标记数据已保存
  unsaved.value = false
  // 更新HashCode
  metadata.value.hashcode = toHashCode(elementData.value)
  // 移除离线数据
  offlineDB.removeItem(localkey.value)
  // 成功提示
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
  top: 8px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>

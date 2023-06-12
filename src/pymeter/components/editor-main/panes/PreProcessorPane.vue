<template>
  <div class="pre-processor-pane">
    <template v-if="!isEmpty(preProcessorList)">
      <!-- 操作按钮 -->
      <div style="margin-bottom: 10px; padding-left: 30px">
        <!-- 全部展开按钮 -->
        <el-button type="primary" link @click="expandAll">
          <SvgIcon icon-name="pymeter-expand-all" style="margin-right: 5px" />
          全部展开
        </el-button>
        <!-- 全部收起按钮 -->
        <el-button type="primary" link @click="collapseAll">
          <SvgIcon icon-name="pymeter-collapse-all" style="margin-right: 5px" />
          全部收起
        </el-button>
      </div>

      <!-- 可拖拽排序列表 -->
      <draggable
        ref="draggableRef"
        class="list-group"
        tag="el-collapse"
        handle=".handle"
        item-key="elementNo"
        :disabled="queryMode"
        :list="preProcessorList"
        :component-data="{ modelValue: activeNames, 'onUpdate:modelValue': (val) => (activeNames = val) }"
      >
        <template #item="{ element, index }">
          <el-collapse-item :key="element.elementNo" :name="element.elementNo" class="list-group-item">
            <template #title>
              <!-- 排序图标 -->
              <el-button
                v-show="!queryMode"
                style="margin-right: 10px; font-size: 16px"
                class="handle"
                type="primary"
                link
                :icon="Sort"
              />
              <!-- 组件序号 -->
              <el-tag style="margin-right: 10px" type="info" size="large" disable-transitions>
                {{ index + 1 }}
              </el-tag>
              <!-- 组件类型 -->
              <el-tag style="margin-right: 10px" type="info" size="large" disable-transitions>
                {{ ElementClass[element.elementClass] }}
              </el-tag>
              <!-- 组件名称 -->
              <el-input
                v-model="element.elementName"
                style="margin-right: 10px"
                :readonly="queryMode"
                @click.stop
                @keypress.space.stop
              />
              <!-- 组件状态 -->
              <el-switch
                v-model="element.enabled"
                style="margin-right: 10px"
                size="small"
                :disabled="queryMode"
                @click.stop
              />
              <!-- 删除按钮 -->
              <el-button
                v-show="!queryMode"
                type="danger"
                style="margin-right: 10px; font-size: 16px"
                link
                :icon="Delete"
                @click.stop="remove(index)"
              />
            </template>

            <!-- 动态逐渐 -->
            <component
              :is="components[element.elementClass]"
              :key="element.elementNo"
              :read-only="queryMode"
              :owner-type="ownerType"
              :element-no="element.elementNo"
              :element-name="element.elementName"
              :element-type="element.elementType"
              :element-class="element.elementClass"
              :element-property="element.property"
            />
          </el-collapse-item>
        </template>
      </draggable>
    </template>

    <!-- 添加按钮 -->
    <div v-show="!queryMode" style="margin: 10px 0; padding-left: 30px">
      <el-popover
        v-model:visible="menuVisible"
        trigger="click"
        placement="right-start"
        transition="el-zoom-in-top"
        :teleported="false"
      >
        <template #reference>
          <el-button type="primary" link :icon="Plus">添加处理器</el-button>
        </template>
        <el-button link @click="addPythonPreProcessor">Python脚本</el-button>
        <el-button link @click="addSleepPreProcessor">固定定时器</el-button>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import { isEmpty } from 'lodash-es'
import { Delete, Plus, Sort } from '@element-plus/icons-vue'
import { ElementClass } from '@/api/enum'

const components = {
  PythonPreProcessor: markRaw(defineAsyncComponent(() => import('./PythonEditorPanel.vue'))),
  SleepPreProcessor: markRaw(defineAsyncComponent(() => import('./SleepPreProcessorPanel.vue')))
}

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  editMode: { type: String, default: 'QUERY' },
  ownerType: { type: String, required: true } // ALL | HTTP | PYTHON | SQL
})

const attrs = useAttrs()
const queryMode = computed(() => props.editMode === 'QUERY')
const preProcessorList = computed({
  get: () => attrs.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const activeNames = ref([])
const menuVisible = ref(false)
const draggableRef = ref()

onMounted(() => {
  if (preProcessorList.value.length == 1) {
    activeNames.value.push(preProcessorList.value[0].elementNo)
  }
})

onBeforeUnmount(() => {
  // sortable destroy 时会报错
  // https://github.com/SortableJS/Sortable/issues/2201
  const draggable = draggableRef.value
  if (draggable?._sortable) draggable._sortable = undefined
})

const addPythonPreProcessor = () => {
  // 生成临时元素编号
  const elementNo = Date.now().toString()
  // 使新组件处于打开状态
  activeNames.value.push(elementNo)
  // 添加新组件
  preProcessorList.value.push({
    elementNo: elementNo,
    elementName: 'Python脚本',
    elementType: 'PRE_PROCESSOR',
    elementClass: 'PythonPreProcessor',
    enabled: true,
    property: { PythonPreProcessor__script: '' }
  })
  // 关闭菜单
  menuVisible.value = false
}

const addSleepPreProcessor = () => {
  // 生成临时元素编号
  const elementNo = Date.now().toString()
  // 使新组件处于打开状态
  activeNames.value.push(elementNo)
  // 添加新组件
  preProcessorList.value.push({
    elementNo: elementNo,
    elementName: '固定定时器',
    elementType: 'PRE_PROCESSOR',
    elementClass: 'SleepPreProcessor',
    enabled: true,
    property: { SleepPreProcessor__delay: '0' }
  })
  // 关闭菜单
  menuVisible.value = false
}

const remove = (index) => {
  preProcessorList.value.splice(index, 1)
}

const expandAll = () => {
  activeNames.value = preProcessorList.value.map((item) => item.elementNo)
}

const collapseAll = () => {
  activeNames.value = []
}
</script>

<style lang="scss" scoped>
.pre-processor-pane {
  margin-bottom: 20px;
}

.handle {
  cursor: move;
}

:deep(.el-popper) {
  padding: 5px 0 !important;

  .el-button {
    justify-content: flex-start;
    width: 100%;
    padding: 5px 16px;
    line-height: 22px;
    color: var(--el-text-color-regular);
    font-size: var(--el-font-size-base);
    font-family: inherit;
    font-weight: inherit;
    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9) !important;
    }
  }

  .el-button + .el-button {
    margin-left: 0;
  }
}

:deep(.el-empty) {
  padding: 10px 0;
}

:deep(.el-empty__description) {
  display: none;
}
</style>

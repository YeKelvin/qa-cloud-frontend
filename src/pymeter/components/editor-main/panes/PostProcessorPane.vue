<template>
  <div class="post-processor-pane">
    <template v-if="!isEmpty(postProcessorList)">
      <!-- 操作按钮 -->
      <div style="padding-left: 30px; margin-bottom: 10px">
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
        handle=".move-handle"
        item-key="elementNo"
        :disabled="queryMode"
        :list="postProcessorList"
        :component-data="{ modelValue: activeNames, 'onUpdate:modelValue': (val) => (activeNames = val) }"
      >
        <template #item="{ element, index }">
          <el-collapse-item :key="element.elementNo" :name="element.elementNo" class="list-group-item">
            <template #title>
              <!-- 排序图标 -->
              <el-button v-show="!queryMode" class="move-handle" link @click.stop>
                <SvgIcon icon-name="pymeter-move" />
              </el-button>
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

            <!-- 动态组件 -->
            <component
              :is="components[element.elementClass]"
              :key="element.elementNo"
              :readonly="queryMode"
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
    <div style="padding-left: 30px; margin: 15px 0">
      <el-popover
        v-model:visible="menuVisible"
        trigger="click"
        placement="right-start"
        transition="el-zoom-in-top"
        :teleported="false"
      >
        <template #reference>
          <el-button type="primary" link :icon="Plus" :disabled="queryMode">添加处理器</el-button>
        </template>
        <el-button link @click="addPythonPostProcessor">Python脚本</el-button>
        <el-button link @click="addJsonPathPostProcessor">Json提取器</el-button>
        <el-button link @click="addSleepPostProcessor">固定定时器</el-button>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import { isEmpty } from 'lodash-es'
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElementClass } from '@/api/enum'

const components = {
  PythonPostProcessor: markRaw(defineAsyncComponent(() => import('./PythonEditorPanel.vue'))),
  JsonPathPostProcessor: markRaw(defineAsyncComponent(() => import('./JsonPathPostProcessorPanel.vue'))),
  SleepPostProcessor: markRaw(defineAsyncComponent(() => import('./SleepPostProcessorPanel.vue')))
}

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  editMode: { type: String, default: 'QUERY' },
  ownerType: { type: String, required: true } // HTTP | PYTHON | SQL
})

const attrs = useAttrs()
const queryMode = computed(() => props.editMode === 'QUERY')
const postProcessorList = computed({
  get: () => attrs.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const activeNames = ref([])
const menuVisible = ref(false)
const draggableRef = ref()

onMounted(() => {
  if (postProcessorList.value.length === 1) {
    activeNames.value.push(postProcessorList.value[0].elementNo)
  }
})

onBeforeUnmount(() => {
  // TODO: sortable destroy 时会报错
  // https://github.com/SortableJS/Sortable/issues/2201
  const draggable = draggableRef.value
  if (draggable?._sortable) draggable._sortable = undefined
})

const addPythonPostProcessor = () => {
  // 生成临时元素编号
  const elementNo = Date.now().toString()
  // 使新组件处于打开状态
  activeNames.value.push(elementNo)
  // 添加新组件
  postProcessorList.value.push({
    elementNo: elementNo,
    elementName: 'Python脚本',
    elementType: 'POST_PROCESSOR',
    elementClass: 'PythonPostProcessor',
    enabled: true,
    property: {
      PythonPostProcessor__script: ''
    }
  })
  // 闭关菜单
  menuVisible.value = false
}

const addJsonPathPostProcessor = () => {
  // 生成临时元素编号
  const elementNo = Date.now().toString()
  // 使新组件处于打开状态
  activeNames.value.push(elementNo)
  // 添加新组件
  postProcessorList.value.push({
    elementNo: elementNo,
    elementName: 'Json提取器',
    elementType: 'POST_PROCESSOR',
    elementClass: 'JsonPathPostProcessor',
    enabled: true,
    property: {
      JsonPathPostProcessor__variable_scope: 'LOCAL',
      JsonPathPostProcessor__variable_name: '',
      JsonPathPostProcessor__jsonpath: '',
      JsonPathPostProcessor__list_random: 'false',
      JsonPathPostProcessor__default_value: ''
    }
  })
  // 闭关菜单
  menuVisible.value = false
}

const addSleepPostProcessor = () => {
  // 生成临时元素编号
  const elementNo = Date.now().toString()
  // 使新组件处于打开状态
  activeNames.value.push(elementNo)
  // 添加新组件
  postProcessorList.value.push({
    elementNo: elementNo,
    elementName: '固定定时器',
    elementType: 'POST_PROCESSOR',
    elementClass: 'SleepPostProcessor',
    enabled: true,
    property: {
      SleepPostProcessor__delay: '0'
    }
  })
  // 闭关菜单
  menuVisible.value = false
}

const remove = (index) => {
  postProcessorList.value.splice(index, 1)
}

const expandAll = () => {
  activeNames.value = postProcessorList.value.map((item) => item.elementNo)
}

const collapseAll = () => {
  activeNames.value = []
}
</script>

<style lang="scss" scoped>
.post-processor-pane {
  margin-bottom: 20px;
}

.move-handle {
  margin-right: 10px;
  font-size: 16px;
  cursor: grab;
}

:deep(.el-popper) {
  padding: 5px 0 !important;

  .el-button {
    justify-content: flex-start;
    width: 100%;
    padding: 5px 16px;
    font-family: inherit;
    font-size: var(--el-font-size-base);
    font-weight: inherit;
    line-height: 22px;
    color: var(--el-text-color-regular);

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

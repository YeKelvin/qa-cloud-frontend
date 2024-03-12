<template>
  <div class="post-processor-pane">
    <!-- 操作按钮 -->
    <el-affix target=".pymeter-component-container" position="top" :offset="150">
      <div style="display: flex; justify-content: space-between; padding: 0 5px 0 30px; margin-bottom: 10px">
        <span>
          <!-- 添加按钮 -->
          <el-popover
            v-model:visible="menuVisible"
            trigger="click"
            placement="bottom-start"
            transition="el-zoom-in-top"
            :teleported="false"
          >
            <template #reference>
              <el-button type="primary" link :icon="Plus">添加处理器</el-button>
            </template>
            <el-button link @click="addPythonPostProcessor">Python脚本</el-button>
            <el-button link @click="addJsonPathPostProcessor">Json提取器</el-button>
            <el-button link @click="addSleepPostProcessor">固定定时器</el-button>
          </el-popover>
        </span>
        <span v-if="!isEmpty(postProcessorList)">
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
        </span>
      </div>
    </el-affix>

    <template v-if="!isEmpty(postProcessorList)">
      <!-- 可拖拽排序列表 -->
      <draggable
        ref="draggableRef"
        tag="el-collapse"
        class="list-group"
        handle=".move-handle"
        item-key="elementNo"
        :list="postProcessorList"
        :component-data="{ modelValue: activeNames, 'onUpdate:modelValue': (val) => (activeNames = val) }"
      >
        <template #item="{ element, index }">
          <el-collapse-item :key="element.elementNo" :name="element.elementNo" class="list-group-item">
            <template #title>
              <!-- 排序图标 -->
              <el-button class="move-handle" link @click.stop>
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
              <FxInput
                v-model="element.elementName"
                style="margin-right: 10px"
                @click.stop
                @keydown.space.stop
                @keyup.space.prevent
                @keydown.enter.stop.prevent
              />
              <!-- 组件状态 -->
              <el-switch v-model="element.enabled" style="margin-right: 10px" size="small" @click.stop />
              <!-- 删除按钮 -->
              <el-button
                type="danger"
                style="margin-right: 10px; font-size: 18px"
                link
                :icon="Delete"
                @click.stop="remove(index)"
              />
            </template>

            <!-- 动态组件 -->
            <component
              :is="components[element.elementClass]"
              :key="element.elementNo"
              :owner-type="ownerType"
              :element-no="element.elementNo"
              :element-name="element.elementName"
              :element-type="element.elementType"
              :element-class="element.elementClass"
              :element-props="element.elementProps"
            />
          </el-collapse-item>
        </template>
      </draggable>
    </template>
  </div>
</template>

<script setup>
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'
import { ElementClass } from '@/api/enum'
import { Delete, Plus } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import draggable from 'vuedraggable'

const components = {
  PythonPostProcessor: markRaw(defineAsyncComponent(() => import('./PythonEditorPanel.vue'))),
  JsonPathPostProcessor: markRaw(defineAsyncComponent(() => import('./JsonPathPostProcessorPanel.vue'))),
  SleepPostProcessor: markRaw(defineAsyncComponent(() => import('./SleepPostProcessorPanel.vue')))
}

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const props = defineProps({
  ownerType: { type: String, required: true } // HTTP | PYTHON | SQL
})
const postProcessorList = computed({
  get: () => attrs.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const activeNames = ref([])
const menuVisible = ref(false)
const draggableRef = ref()

watch(postProcessorList, (list) => list.forEach((item, index) => (item.elementIndex = index + 1)))

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
    enabled: true,
    elementNo: elementNo,
    elementName: 'Python后置处理器',
    elementType: 'POST_PROCESSOR',
    elementClass: 'PythonPostProcessor',
    elementProps: {
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
    enabled: true,
    elementNo: elementNo,
    elementName: 'Json提取器',
    elementType: 'POST_PROCESSOR',
    elementClass: 'JsonPathPostProcessor',
    elementProps: {
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
    enabled: true,
    elementNo: elementNo,
    elementName: '固定定时器',
    elementType: 'POST_PROCESSOR',
    elementClass: 'SleepPostProcessor',
    elementProps: {
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

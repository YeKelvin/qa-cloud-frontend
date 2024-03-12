<template>
  <div class="function-input">
    <!-- 二次封装el-input -->
    <el-input
      ref="elInputRef"
      v-bind="$attrs"
      :model-value="attrs.modelValue"
      @blur="focused = false"
      @focus="focused = true"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <!-- 继承插槽 -->
      <template v-for="(key, name) in $slots" #[name]="scope" :key="key">
        <slot :name="name" v-bind="scope" />
      </template>
      <!-- 函数助手图标 -->
      <template #suffix>
        <el-button v-if="hovered || focused" link type="primary">
          <SvgIcon icon-name="pymeter-magic" style="font-size: 18px" @click="openFuncitonHelper()" />
        </el-button>
      </template>
    </el-input>

    <!-- 函数助手 -->
    <template v-if="helperVisible">
      <FuncitonDialog v-model="helperVisible" @insert="insert" />
    </template>
  </div>
</template>

<script setup>
import FuncitonDialog from './FuncitonDialog.vue'

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const props = defineProps({
  maximizable: { type: Boolean, default: false }
})

const focused = ref(false)
const hovered = ref(false)
const elInputRef = ref(null)
const helperVisible = ref(false)

// 光标开始位置
const startPos = ref(0)
// 光标结束位置
const endPos = ref(0)

/**
 * 打开函数助手
 */
const openFuncitonHelper = () => {
  // 记录光标位置
  recordSelection()
  // 打开函数助手
  helperVisible.value = true
}

/**
 * 记录光标开始和结束位置
 */
const recordSelection = () => {
  // 获取 Input Dom 对象
  const inputRef = elInputRef.value.input
  // 记录光标开始和结束位置
  startPos.value = inputRef.selectionStart
  endPos.value = inputRef.selectionEnd
}

/**
 * 在光标位置插入或替换选中的文本
 */
const insert = (value) => {
  // 分割字符串
  const textBefore = attrs.modelValue.slice(0, startPos.value)
  const textAfter = attrs.modelValue.slice(endPos.value)
  // 在光标位置插入或替换选中的文本
  emit('update:modelValue', `${textBefore}${value}${textAfter}`)
  // 设置光标位置
  nextTick(() => setCursorPosition(startPos.value + value.length))
}

/**
 * 设置光标位置
 */
const setCursorPosition = (position) => {
  // 获取 Input Dom 对象
  const inputRef = elInputRef.value.input
  // 设置光标位置
  if (inputRef.setSelectionRange) {
    inputRef.focus()
    inputRef.setSelectionRange(position, position)
  } else if (inputRef.createTextRange) {
    const range = inputRef.createTextRange()
    range.collapse(true)
    range.moveEnd('character', position)
    range.moveStart('character', position)
    range.select()
  }
}

defineExpose({
  blur: () => elInputRef.value.blur(),
  clear: () => elInputRef.value.clear(),
  focus: () => elInputRef.value.focus(),
  input: () => elInputRef.value.input,
  ref: () => elInputRef.value.ref,
  resizeTextarea: () => elInputRef.value.resizeTextarea(),
  select: () => elInputRef.value.select(),
  textarea: () => elInputRef.value.textarea,
  textareaStyle: () => elInputRef.value.textareaStyle
})
</script>

<style lang="scss" scoped>
.function-input {
  display: flex;
  flex: 1;
  width: 100%;
}
</style>

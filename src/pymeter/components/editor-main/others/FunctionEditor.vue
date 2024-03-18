<template>
  <div class="function-editor" @mouseenter="hovered = true" @mouseleave="hovered = false">
    <MonacoEditor
      ref="editorRef"
      v-bind="$attrs"
      :model-value="attrs.modelValue"
      @blur="focused = false"
      @focus="focused = true"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <template v-if="hovered || focused">
      <el-button
        link
        type="primary"
        class="magic-button"
        :class="{ 'hide-line-numbers': attrs['line-numbers'] === 'off' }"
        @click="openFuncitonHelper()"
      >
        <SvgIcon icon-name="pymeter-magic" style="font-size: 22px" />
      </el-button>
    </template>

    <template v-if="helperVisible">
      <FuncitonDialog v-model="helperVisible" @insert="insert" />
    </template>
  </div>
</template>

<script setup>
import FuncitonDialog from './FuncitonDialog.vue'

import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const focused = ref(false)
const hovered = ref(false)
const editorRef = ref()
const helperVisible = ref(false)

/**
 * 打开函数助手
 */
const openFuncitonHelper = () => {
  // 打开函数助手
  helperVisible.value = true
}

/**
 * 在光标位置插入或替换选中的文本
 */
const insert = (val) => {
  editorRef.value.insert(val)
}

defineExpose({
  insert: (val) => editorRef.value.insert(val),
  insertSnippet: (val) => editorRef.value.insertSnippet(val),
  setValue: (val) => editorRef.value.setValue(val),
  getValue: () => editorRef.value.getValue(),
  getSelectionValue: () => editorRef.value.getSelectionValue(),
  getLineContent: () => editorRef.value.getLineContent(),
  getLineCount: () => editorRef.value.getLineCount(),
  getCursorPosition: () => editorRef.value.getCursorPosition(),
  setCursorPosition: ({ column, lineNumber }) => editorRef.value.setCursorPosition({ column, lineNumber }),
  focus: () => editorRef.value.focus(),
  formatDocument: () => editorRef.value.formatDocument(),
  scrollToBottom: () => editorRef.value.scrollToBottom()
})
</script>

<style lang="scss" scoped>
.function-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin-bottom: 10px;
}

.magic-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.hide-line-numbers {
  right: 5px !important;
  bottom: 5px !important;
}
</style>

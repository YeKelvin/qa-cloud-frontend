<template>
  <textarea
    ref="textareaRef"
    class="autosize-textarea"
    placeholder=" "
    :value="attrs.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
import { debounce, isEmpty } from 'lodash-es'

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const textareaRef = ref()

onMounted(() => {
  if (isEmpty(attrs.modelValue)) return
  resize()
})

watch(
  () => attrs.modelValue,
  () => resize()
)

const resize = debounce(() => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = '32px'
  }
  if (textarea && textarea.scrollHeight) {
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}, 100)
</script>

<style lang="scss" scoped>
.autosize-textarea {
  position: relative;
  box-sizing: border-box;
  display: table-cell;
  width: 100%;
  height: 32px;
  padding: 0;
  overflow: hidden;
  font-family: inherit;
  font-size: inherit;
  line-height: 32px;
  color: var(--el-text-color-regular);
  letter-spacing: 0.6px;
  vertical-align: middle;
  resize: None;
  background-color: inherit;
  background-image: none;
  border: None;
  border-color: var(--el-border-color);
  outline: None;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }

  &:hover {
    border-bottom: 1px solid var(--el-border-color);
  }

  &:placeholder-shown {
    border-bottom: 1px solid var(--el-border-color);
  }

  &:focus {
    border-bottom: 1px solid var(--el-color-primary);
  }
}
</style>

<template>
  <textarea
    ref="textareaRef"
    class="autosize-textarea"
    placeholder=" "
    :value="attrs.modelValue"
    @input="handleInput"
  />
</template>

<script setup>
const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const textareaRef = ref()

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      if (attrs.modelValue) resizeTextarea()
    }, 100)
  })
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  nextTick(resizeTextarea)
}

const resizeTextarea = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = '32px'
  }
  if (textarea && textarea.scrollHeight) {
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}
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

  /* border-radius: 4px; */
  outline: None;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }

  &:hover {
    border-bottom: 1px solid var(--el-border-color);

    /* border-bottom-right-radius: 0; */

    /* border-bottom-left-radius: 0; */
  }

  &:placeholder-shown {
    border-bottom: 1px solid var(--el-border-color);

    /* border-bottom-right-radius: 0; */

    /* border-bottom-left-radius: 0; */
  }

  &:focus {
    border-color: var(--el-color-primary);

    /* border-bottom-right-radius: 0; */

    /* border-bottom-left-radius: 0; */
  }
}
</style>

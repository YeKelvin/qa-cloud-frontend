<template>
  <textarea ref="textareaRef" class="autosize-textarea" :value="attrs.modelValue" @input="handleInput" />
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
  padding: 0 10px;
  overflow: hidden;
  font-family: inherit;
  font-size: inherit;
  line-height: 32px;
  color: #606266;
  letter-spacing: 0.6px;
  vertical-align: middle;
  resize: None;
  background-color: #fff;
  background-image: none;
  border: 0;
  border-bottom: 1px solid #dcdfe6;
  border-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  outline: 0;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &::placeholder {
    color: #a8abb2;
  }

  &:hover {
    border-color: #a8abb2;
  }

  &:focus {
    border-color: #409eff;
    outline: none;
  }
}
</style>

<template>
  <div class="fx-input">
    <div class="fx-input__wrapper">
      <div
        ref="inputRef"
        class="fx-input__inner"
        contenteditable
        @input="handleInput"
        @blur="focused = false"
        @focus="focused = true"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
        @compositionstart="handleStart"
        @compositionend="handleEnd"
      />
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const focused = ref(false)
const hovered = ref(false)
const inputRef = ref(null)
// 中文输入中
const composing = ref(false)

const highlight = (data) => {
  return data.replace(/\${(.*?)}/g, '<span class="highlight">$&</span>')
}

onMounted(() => {
  inputRef.value.innerHTML = highlight(attrs.modelValue)
  nextTick(() => {
    const input = inputRef.value
    input.style.height = 'auto'
    input.style.height = `${input.scrollHeight}px`
  })
})

watch(
  () => attrs.modelValue,
  () => {
    inputRef.value.innerHTML = highlight(attrs.modelValue)
    nextTick(() => {
      const input = inputRef.value
      input.style.height = 'auto'
      input.style.height = `${input.scrollHeight}px`
    })
  }
)

const handleInput = (event) => {
  if (composing.value) return

  const text = event.target.innerText
  const cursorPos = getCursorPosition()
  emit('update:modelValue', text)
  event.target.innerHTML = highlight(text)
  if (cursorPos !== text.length) {
    setSelectionRange(event.target, cursorPos, cursorPos)
  } else {
    setEndOfContenteditable(event.target)
  }
}

const handleStart = () => {
  composing.value = true
}

const handleEnd = (event) => {
  composing.value = false
  handleInput(event)
}

const getCursorPosition = (el) => {
  const selection = window.getSelection()
  const range = selection.createRange()
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(el)
  preCaretRange.setEnd(range.endContainer, range.endOffset)
  return preCaretRange.toString().length
}

const getTextNodesIn = (node) => {
  const textNodes = []
  if (node.nodeType === 3) {
    textNodes.push(node)
  } else {
    const children = node.childNodes
    for (let i = 0, len = children.length; i < len; ++i) {
      textNodes.push.apply(textNodes, getTextNodesIn(children[i]))
    }
  }
  return textNodes
}

const setSelectionRange = (el, start, end) => {
  const range = document.createRange()
  range.selectNodeContents(el)
  const textNodes = getTextNodesIn(el)
  let foundStart = false
  let charCount = 0
  let endCharCount

  for (let i = 0, textNode; (textNode = textNodes[i++]); ) {
    endCharCount = charCount + textNode.length
    if (
      !foundStart &&
      start >= charCount &&
      (start < endCharCount || (start === endCharCount && i < textNodes.length))
    ) {
      range.setStart(textNode, start - charCount)
      foundStart = true
    }
    if (foundStart && end <= endCharCount) {
      range.setEnd(textNode, end - charCount)
      break
    }
    charCount = endCharCount
  }
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

const setEndOfContenteditable = (el) => {
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}
</script>

<style lang="scss" scoped>
.fx-input {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  width: 100%;
  height: 32px;
  font-size: 14px;
  line-height: 32px;
  vertical-align: middle;
}

.fx-input__wrapper {
  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 1px 11px;
  cursor: text;
  background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
  background-image: none;
  border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
  transition: var(--el-transition-box-shadow);
  transform: translate3d(0, 0, 0);
}

.fx-input__inner {
  box-sizing: border-box;
  display: block;
  flex-grow: 1;
  width: 100%;
  padding: 0;
  line-height: 1.5;
  color: var(--el-input-text-color, var(--el-text-color-regular));
  letter-spacing: 0.6px;
  background: 0 0;
  outline: 0;

  /* &:empty::before {
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: var(--dt-text-color4);
    content: attr(placeholder);
  } */
}

.highlight {
  font-weight: bold;
  color: #409eff;
  background-color: #f0f7ff;
}
</style>

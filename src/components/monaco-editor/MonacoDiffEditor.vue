<template>
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
    <div ref="editorRef" class="code-diff-editor-container" />
  </div>
</template>

<script setup>
import monaco from './monaco.base'
import monacoOptions from './monaco.options'

const editorRef = ref()
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  theme: { type: String, default: 'vs' },
  height: { type: [String, Number], default: '300px' },
  language: { type: String, required: true },
  fontSize: { type: Number, default: 14 },
  readonly: { type: Boolean, default: true },
  wordWrap: { type: String, default: 'on' },
  lineNumbers: { type: String, default: 'on' },
  oldValue: { type: String, default: '' },
  newValue: { type: String, default: '' }
})
const styleHeight = computed(() => (isNaN(props.height) ? props.height : `${props.height}px`))
const options = computed(() => {
  const opts = { ...monacoOptions }
  if (props.lineNumbers === 'off') {
    Object.assign(opts, {
      lineNumbersMinChars: 0,
      lineDecorationsWidth: 0,
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      glyphMargin: false,
      folding: false,
      links: false
    })
  }
  return opts
})

watch(
  () => props.wordWrap,
  (val) => instance.updateOptions({ diffWordWrap: val })
)

let instance
let originalModel
let modifiedModel
onMounted(() => {
  originalModel = monaco.editor.createModel(props.oldValue, props.language)
  modifiedModel = monaco.editor.createModel(props.newValue, props.language)
  instance = monaco.editor.createDiffEditor(editorRef.value, {
    theme: props.theme,
    fontSize: props.fontSize,
    language: props.language,
    readOnly: props.readonly,
    wordWrap: props.wordWrap,
    lineNumbers: props.lineNumbers,
    ...options.value
  })
  instance.setModel({
    original: originalModel,
    modified: modifiedModel
  })
})

onUnmounted(() => {
  instance && instance.dispose()
})

const setOldValue = (val) => {
  originalModel.setValue(prettyData(val))
}

const setNewValue = (val) => {
  modifiedModel.setValue(prettyData(val))
}

const prettyData = (val) => {
  try {
    return JSON.stringify(JSON.parse(val), null, 2)
  } catch (error) {
    return val
  }
}

defineExpose({
  setOldValue,
  setNewValue
})
</script>

<style lang="scss" scoped>
.code-diff-editor-container {
  flex-grow: 1;
  width: 100%;
  height: v-bind(styleHeight);
  padding: 1px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>

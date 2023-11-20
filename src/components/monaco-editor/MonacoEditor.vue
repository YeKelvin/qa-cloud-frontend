<template>
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
    <div ref="editorRef" class="code-editor-container" />
  </div>
</template>

<script setup>
import { debounce } from 'lodash-es'
import monaco from './monaco.base'
import monacoOptions from './monaco.options'

let instance
const editorRef = ref()
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: { type: String, default: '' },
  theme: { type: String, default: 'vs' },
  height: { type: [String, Number], default: '300px' },
  language: { type: String, required: true },
  fontSize: { type: Number, default: 14 },
  readonly: { type: Boolean, default: false },
  wordWrap: { type: String, default: 'on' },
  lineNumbers: { type: String, default: 'on' }
})
const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const styleHeight = computed(() => (isNaN(props.height) ? props.height : `${props.height}px`))
const options = computed(() => {
  const opts = { ...monacoOptions }
  if (props.lineNumbers === 'off') {
    Object.assign(opts, {
      links: false,
      folding: false,
      glyphMargin: false,
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      lineNumbersMinChars: 0,
      lineDecorationsWidth: 0
    })
  }
  return opts
})

watch(
  () => props.language,
  (val) => monaco.editor.setModelLanguage(instance.getModel(), val)
)
watch(
  () => props.readonly,
  (val) => instance.updateOptions({ readOnly: val })
)
watch(
  () => props.wordWrap,
  (val) => instance.updateOptions({ wordWrap: val })
)

onMounted(async () => {
  instance = await createEditor()
  // 设置行尾符合为\n
  instance.getModel().setEOL(monaco.editor.EndOfLinePreference.LF)
  // 双向绑定
  instance.onDidChangeModelContent(debounce(() => emit('update:modelValue', instance.getValue()), 200))
  // 移除有冲突的默认快捷键
  removeDefaultKeybindings()
})
onUnmounted(() => {
  instance && instance.dispose()
})

const createEditor = async () => {
  instance = monaco.editor.create(editorRef.value, {
    fontSize: props.fontSize,
    language: props.language,
    readOnly: props.readonly,
    wordWrap: props.wordWrap,
    lineNumbers: props.lineNumbers,
    theme: props.theme,
    value: localValue.value,
    ...options.value
  })
  await waitingCreated()
  return instance
}

const waitingCreated = () => {
  let timeoutId = null
  let intervalId = null

  return new Promise((resolve, reject) => {
    if (instance) resolve()

    timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      ElMessage({ message: '创建MonacoEditor超时，请刷新重试!', type: 'error', duration: 2 * 1000 })
      reject(new Error('fail'))
    }, 5000)

    intervalId = setInterval(() => {
      if (instance) {
        clearInterval(intervalId)
        clearTimeout(timeoutId)
        resolve()
      }
    }, 100)
  })
}

const removeDefaultKeybindings = () => {
  // 移除 CtrlCmd + E 快捷键
  // removeKeybinding('actions.findWithSelection')
  // 移除 CtrlCmd + K 快捷键
  removeKeybinding('deleteAllRight')
  removeKeybinding('editor.action.setSelectionAnchor')
  removeKeybinding('editor.action.selectFromAnchorToCursor')
  removeKeybinding('editor.action.addCommentLine')
  removeKeybinding('editor.action.removeCommentLine')
  removeKeybinding('editor.unfoldAll')
  removeKeybinding('editor.unfoldAllExcept')
  removeKeybinding('editor.unfoldAllMarkerRegions')
  removeKeybinding('editor.unfoldRecursively')
  removeKeybinding('editor.foldAll')
  removeKeybinding('editor.foldAllExcept')
  removeKeybinding('editor.foldAllBlockComments')
  removeKeybinding('editor.foldAllMarkerRegions')
  removeKeybinding('editor.foldRecursively')
  removeKeybinding('editor.foldLevel1')
  removeKeybinding('editor.foldLevel2')
  removeKeybinding('editor.foldLevel3')
  removeKeybinding('editor.foldLevel4')
  removeKeybinding('editor.foldLevel5')
  removeKeybinding('editor.foldLevel6')
  removeKeybinding('editor.foldLevel7')
  removeKeybinding('editor.toggleFold')
  removeKeybinding('editor.action.formatSelection')
  removeKeybinding('editor.action.revealDefinitionAside')
  removeKeybinding('editor.action.showHover')
  removeKeybinding('editor.action.trimTrailingWhitespace')
  removeKeybinding('editor.action.deleteLines')
  removeKeybinding('editor.action.moveSelectionToNextFindMatch')
  removeKeybinding('togglePeekWidgetFocus')
}

/**
 * 移除快捷键
 */
const removeKeybinding = (id) => {
  instance._standaloneKeybindingService.addDynamicKeybinding(`-${id}`, monaco.KeyCode.Unknown, () => {})
}

/**
 * 插入内容
 */
const insert = (val) => {
  if (!val) {
    val = String(val)
  }

  const selection = instance.getSelection()
  instance.executeEdits('', [
    {
      range: {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      },
      text: val,
      forceMoveMarkers: true
    }
  ])
}

/**
 * 插入内容
 */
const insertSnippet = (val) => {
  const selection = instance.getSelection()
  instance.getContribution('snippetController2').insert(val, {
    range: {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn
    }
  })
}

/**
 * 设置编辑器内容
 */
const setValue = (val) => {
  if (!val) {
    val = String(val)
  }
  instance.setValue(val)
}

/**
 * 获取编辑器内容
 */
const getValue = () => {
  return instance.getValue()
}

/**
 * 获取选中的内容
 */
const getSelectionValue = () => {
  return instance.getModel().getValueInRange(instance.getSelection())
}

/**
 * 获取某一行的内容
 */
const getLineContent = (lineNumber) => {
  return instance.getModel().getLineContent(lineNumber)
}

/**
 * 获取行数
 */
const getLineCount = () => {
  return instance.getModel().getLineCount()
}

/**
 * 获取光标定位
 */
const getCursorPosition = () => {
  const { column, lineNumber } = instance.getPosition()
  return { column: column, lineNumber: lineNumber }
}

/**
 * 设置光标定位
 */
const setCursorPosition = ({ column, lineNumber }) => {
  instance.setPosition({ column: column, lineNumber: lineNumber })
}

/**
 * 激活编辑器
 */
const focus = () => {
  instance.focus()
}

/**
 * 格式化代码
 */
const formatDocument = () => {
  if (props.readonly) {
    instance.updateOptions({ readOnly: false })
  }
  instance
    .getAction('editor.action.formatDocument')
    .run()
    .then(() => instance.updateOptions({ readOnly: props.readonly }))
}

/**
 * 滚动至底部
 */
const scrollToBottom = () => {
  instance.revealLine(instance.getModel().getLineCount() + 10)
}

/**
 * 打印默认快捷键
 */
const outputKeybindings = () => {
  setTimeout(() => {
    const commands = new Set()
    instance._standaloneKeybindingService._cachedResolver._defaultKeybindings.forEach((item) => {
      if (item.keypressParts.includes('meta+K')) {
        commands.add(item.command)
      }
    })
    console.log(commands)
  }, 1000)
}

defineExpose({
  insert,
  insertSnippet,
  setValue,
  getValue,
  getSelectionValue,
  getLineContent,
  getLineCount,
  getCursorPosition,
  setCursorPosition,
  focus,
  formatDocument,
  scrollToBottom
})
</script>

<style lang="scss" scoped>
.code-editor-container {
  flex-grow: 1;
  width: 100%;
  height: v-bind(styleHeight);
  padding: 1px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>

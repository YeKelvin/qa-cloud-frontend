<template>
  <div class="python-editor-container">
    <MonacoEditor
      ref="pythonEditorRef"
      v-model="localValue"
      language="python"
      class="python-editor"
      :height="props.height"
      :readonly="readonly"
    />
    <div class="right-container">
      <!-- 运行按钮 -->
      <div v-if="runnable" style="padding-left: 10px; margin-bottom: 10px">
        <el-dropdown split-button type="primary" trigger="click" placement="bottom-end" @click="emit('run')">
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
          <span>运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="emit('runall')">
                <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
                <span>完整运行</span>
              </el-dropdown-item>
              <el-dropdown-item @click="emit('runcase')">
                <SvgIcon icon-name="pymeter-send" style="margin-right: 5px; font-size: 18px" />
                <span>用例运行</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <!-- 片段列表 -->
      <span class="snippet-title">代码片段</span>
      <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;">
        <ul class="snippet-code-list">
          <li @click="insertVarsGetter()">获取局部变量</li>
          <li @click="insertPropsGetter()">获取全局变量</li>
          <template v-if="type == 'HTTP' && (phase == 'POST' || phase == 'ASSERTION')">
            <li @click="insertResponseJson()">获取Json响应</li>
          </template>
          <li @click="insertTableData()">获取表数据</li>
          <li @click="insertVarsSetter()">设置局部变量</li>
          <li @click="insertPropsSetter()">设置全局变量</li>
          <li @click="insertLog()">输出日志</li>
          <template v-if="phase == 'ASSERTION'">
            <li @click="insertAssertion()">断言</li>
          </template>
          <li @click="insertToJsonFN()">Json序列化</li>
          <li @click="insertFromJsonFN()">Json反序列化</li>
          <li @click="insertForeachList()">列表遍历</li>
          <li @click="insertForeachDict()">字典遍历</li>
          <li @click="insertListComprehensions()">列表推导式</li>
          <li @click="insertDictComprehensions()">字典推导式</li>
        </ul>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const emit = defineEmits(['update:modelValue', 'run', 'runall', 'runcase'])
const attrs = useAttrs()
const props = defineProps({
  readonly: { type: Boolean, default: false },
  runnable: { type: Boolean, default: false },
  height: { type: [String, Number], default: '300px' },
  phase: { type: String, required: true }, // SAMPLER | PREV | POST | ASSERTION
  type: { type: String, required: true } // PYTHON | HTTP
})
const localValue = computed({
  get: () => attrs.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const pythonEditorRef = ref()

/**
 * 设置编辑器内容
 */
const setValue = (val) => {
  pythonEditorRef.value.setValue(val)
}

/**
 * 获取编辑器内容
 */
const getValue = () => {
  return pythonEditorRef.value.getValue()
}

const insertVarsGetter = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'name'
  pythonEditorRef.value.insertSnippet(`vars.get(\${1:${selection}})`)
  pythonEditorRef.value.focus()
}

const insertPropsGetter = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'name'
  pythonEditorRef.value.insertSnippet(`props.get(\${1:${selection}})`)
  pythonEditorRef.value.focus()
}

const insertVarsSetter = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'value'
  pythonEditorRef.value.insertSnippet(`vars.put('\${1:name}', \${2:${selection}})`)
  pythonEditorRef.value.focus()
}

const insertPropsSetter = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'value'
  pythonEditorRef.value.insertSnippet(`props.put('\${1:name}', \${2:${selection}})`)
  pythonEditorRef.value.focus()
}

const insertResponseJson = () => {
  pythonEditorRef.value.insert('res = result.json\n')
  pythonEditorRef.value.focus()
}

const insertTableData = () => {
  pythonEditorRef.value.insertSnippet("val = vars.get('rows')[0]['${1:colunmName}']\n")
  pythonEditorRef.value.focus()
}

const insertLog = () => {
  const selection = pythonEditorRef.value.getSelectionValue()
  if (selection) {
    pythonEditorRef.value.insert(`log.info(f'{${selection}=}')\n`)
  } else {
    pythonEditorRef.value.insertSnippet("log.info('${1:content}')\n")
  }
  pythonEditorRef.value.focus()
}

const insertAssertion = () => {
  pythonEditorRef.value.insertSnippet("assert ${1:condition}, '${2:message}'\n")
  pythonEditorRef.value.focus()
}

const insertToJsonFN = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'object'
  pythonEditorRef.value.insertSnippet(`to_json(\${1:${selection}})`)
  pythonEditorRef.value.focus()
}

const insertFromJsonFN = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'json_str'
  pythonEditorRef.value.insertSnippet(`from_json(\${1:${selection}})`)
  pythonEditorRef.value.focus()
}

const insertForeachList = () => {
  pythonEditorRef.value.insertSnippet('for ${2:item} in ${1:list_object}:\n    ${3:exp}')
  pythonEditorRef.value.focus()
}

const insertForeachDict = () => {
  pythonEditorRef.value.insertSnippet('for ${2:key}, ${3:value} in ${1:dic_object}.items():\n    ${4:exp}')
  pythonEditorRef.value.focus()
}

const insertListComprehensions = () => {
  pythonEditorRef.value.insertSnippet(
    'comprehensions = [${3:out_exp} for ${2:item} in ${1:list_object} if ${4:condition}]\n'
  )
  pythonEditorRef.value.focus()
}

const insertDictComprehensions = () => {
  pythonEditorRef.value.insertSnippet(
    'comprehensions = {${4:key}:${5:value} for ${2:key}, ${3:value} in ${1:dict_object}.items() if ${6:condition}}\n'
  )
  pythonEditorRef.value.focus()
}

defineExpose({
  setValue,
  getValue
})
</script>

<style lang="scss" scoped>
.python-editor-container {
  display: flex;
  margin-bottom: 10px;
}

.python-editor {
  flex: 1;
  margin-bottom: 10px;
}

.right-container {
  display: flex;
  flex-direction: column;
  width: 140px;
  min-width: 140px;
  max-width: 140px;
  height: 300px;
}

.snippet-title {
  padding: 0 10px;
  font-weight: bold;
  color: #606266;
}

.snippet-code-list {
  padding: 10px;
  padding-bottom: 50px;
  margin: 0;

  li {
    padding-bottom: 5px;
    font-family: inherit;
    font-size: inherit;
    color: #409eff;
    list-style-type: none;
    cursor: pointer;
  }
}
</style>

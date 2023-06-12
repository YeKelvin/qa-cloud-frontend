<template>
  <div class="python-editor-container">
    <MonacoEditor
      ref="pythonEditor"
      v-model="scriptContent"
      language="python"
      class="python-editor"
      :read-only="readOnly"
    />
    <div class="snippet-code-container">
      <span class="snippet-title">代码片段</span>
      <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;">
        <ul class="snippet-code-list">
          <li @click="getVarSnippet()">获取局部变量</li>
          <li @click="getPropSnippet()">获取全局变量</li>
          <template
            v-if="
              ownerType == 'ALL' ||
              (ownerType == 'HTTP' && (elementType == 'POST_PROCESSOR' || elementType == 'ASSERTION'))
            "
          >
            <li @click="getResponseJsonSnippet()">获取Json响应</li>
          </template>
          <li @click="getTableData()">获取表数据</li>
          <li @click="setVarSnippet()">设置局部变量</li>
          <li @click="setPropSnippet()">设置全局变量</li>
          <li @click="outputLogInfo()">输出日志</li>
          <template v-if="elementType == 'ASSERTION'">
            <li @click="assertion()">断言</li>
          </template>
          <li @click="toJson()">Json序列化</li>
          <li @click="fromJson()">Json反序列化</li>
          <li @click="foreachList()">列表遍历</li>
          <li @click="foreachDict()">字典遍历</li>
          <li @click="listComprehensions()">列表推导式</li>
          <li @click="dictComprehensions()">字典推导式</li>
        </ul>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const ScriptPropertyNameEmun = {
  PythonSampler: 'PythonSampler__script',
  PythonPreProcessor: 'PythonPreProcessor__script',
  PythonPostProcessor: 'PythonPostProcessor__script',
  PythonAssertion: 'PythonAssertion__script'
}

const props = defineProps({
  readOnly: Boolean,
  ownerType: String,
  elementType: String,
  elementClass: String,
  elementProperty: Object
})
const properties = computed(() => props.elementProperty)
const scriptPropertyName = computed(() => ScriptPropertyNameEmun[props.elementClass])
const scriptContent = computed({
  get() {
    return properties.value[scriptPropertyName.value]
  },
  set(val) {
    properties.value[scriptPropertyName.value] = val
  }
})
const pythonEditor = ref()

onMounted(() => {
  const content = scriptContent.value
  nextTick(() => {
    setTimeout(() => {
      setValue(content)
    }, 200)
  })
})

/**
 * 设置编辑器内容
 */
const setValue = (val) => {
  pythonEditor.value && pythonEditor.value.setValue(val)
}

/**
 * 获取编辑器内容
 */
const getValue = () => {
  return pythonEditor.value.getValue()
}

const getVarSnippet = () => {
  let selection = pythonEditor.value.getSelectionValue()
  selection = selection || 'name'
  pythonEditor.value.insertSnippet(`vars.get(\${1:${selection}})`)
  pythonEditor.value.focus()
}
const getPropSnippet = () => {
  let selection = pythonEditor.value.getSelectionValue()
  selection = selection || 'name'
  pythonEditor.value.insertSnippet(`props.get(\${1:${selection}})`)
  pythonEditor.value.focus()
}
const getResponseJsonSnippet = () => {
  pythonEditor.value.insert('res = result.json\n')
  pythonEditor.value.focus()
}
const getTableData = () => {
  pythonEditor.value.insertSnippet("val = vars.get('rows')[0]['${1:colunmName}']\n")
  pythonEditor.value.focus()
}
const setVarSnippet = () => {
  let selection = pythonEditor.value.getSelectionValue()
  selection = selection || 'value'
  pythonEditor.value.insertSnippet(`vars.put('\${1:name}', \${2:${selection}})`)
  pythonEditor.value.focus()
}
const setPropSnippet = () => {
  let selection = pythonEditor.value.getSelectionValue()
  selection = selection || 'value'
  pythonEditor.value.insertSnippet(`props.put('\${1:name}', \${2:${selection}})`)
  pythonEditor.value.focus()
}
const outputLogInfo = () => {
  const selection = pythonEditor.value.getSelectionValue()
  if (selection) {
    pythonEditor.value.insert(`log.info(f'{${selection}=}')\n`)
  } else {
    pythonEditor.value.insertSnippet("log.info('${1:content}')\n")
  }
  pythonEditor.value.focus()
}
const assertion = () => {
  pythonEditor.value.insertSnippet("assert ${1:condition}, '${2:message}'\n")
  pythonEditor.value.focus()
}
const toJson = () => {
  let selection = pythonEditor.value.getSelectionValue()
  selection = selection || 'object'
  pythonEditor.value.insertSnippet(`to_json(\${1:${selection}})`)
  pythonEditor.value.focus()
}
const fromJson = () => {
  let selection = pythonEditor.value.getSelectionValue()
  selection = selection || 'json_str'
  pythonEditor.value.insertSnippet(`from_json(\${1:${selection}})`)
  pythonEditor.value.focus()
}
const foreachList = () => {
  pythonEditor.value.insertSnippet('for ${2:item} in ${1:list_object}:\n    ${3:exp}')
  pythonEditor.value.focus()
}
const foreachDict = () => {
  pythonEditor.value.insertSnippet('for ${2:key}, ${3:value} in ${1:dic_object}.items():\n    ${4:exp}')
  pythonEditor.value.focus()
}
const listComprehensions = () => {
  pythonEditor.value.insertSnippet(
    'comprehensions = [${3:out_exp} for ${2:item} in ${1:list_object} if ${4:condition}]\n'
  )
  pythonEditor.value.focus()
}
const dictComprehensions = () => {
  pythonEditor.value.insertSnippet(
    'comprehensions = {${4:key}:${5:value} for ${2:key}, ${3:value} in ${1:dict_object}.items() if ${6:condition}}\n'
  )
  pythonEditor.value.focus()
}
</script>

<style lang="scss" scoped>
.python-editor-container {
  display: flex;
}

.python-editor {
  flex: 1;
}

.snippet-code-container {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  height: 300px;
  padding-bottom: 20px;
}

.snippet-title {
  padding: 0 10px;
  color: #606266;
  font-weight: bold;
}

.snippet-code-list {
  margin: 0;
  padding: 10px;

  li {
    list-style-type: none;
    cursor: pointer;
    color: #409eff;
    font-size: inherit;
    font-family: inherit;
    padding-bottom: 5px;
  }
}
</style>

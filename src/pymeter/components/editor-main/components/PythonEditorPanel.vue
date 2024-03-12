<template>
  <div class="python-editor">
    <FxEditor ref="pythonEditorRef" v-model="scriptContent" language="python" style="flex: 1" />
    <div class="snippet-code">
      <span class="snippet-title">代码片段</span>
      <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;">
        <ul class="snippet-list">
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
import FxEditor from '@/pymeter/components/editor-main/others/FunctionEditor.vue'

const ScriptPropertyNameEmun = {
  PythonSampler: 'PythonSampler__script',
  PythonAssertion: 'PythonAssertion__script',
  PythonPrevProcessor: 'PythonPrevProcessor__script',
  PythonPostProcessor: 'PythonPostProcessor__script'
}

const props = defineProps({
  ownerType: String,
  elementType: String,
  elementClass: String,
  elementProps: Object
})
const elementProperty = computed(() => props.elementProps)
const scriptPropertyName = computed(() => ScriptPropertyNameEmun[props.elementClass])
const scriptContent = computed({
  get: () => elementProperty.value[scriptPropertyName.value],
  set: (val) => (elementProperty.value[scriptPropertyName.value] = val)
})
const pythonEditorRef = ref()

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
  pythonEditorRef.value && pythonEditorRef.value.setValue(val)
}

/**
 * 获取编辑器内容
 */
const getValue = () => {
  return pythonEditorRef.value.getValue()
}

const getVarSnippet = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'name'
  pythonEditorRef.value.insertSnippet(`vars.get(\${1:${selection}})`)
  pythonEditorRef.value.focus()
}
const getPropSnippet = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'name'
  pythonEditorRef.value.insertSnippet(`props.get(\${1:${selection}})`)
  pythonEditorRef.value.focus()
}
const getResponseJsonSnippet = () => {
  pythonEditorRef.value.insert('res = result.json\n')
  pythonEditorRef.value.focus()
}
const getTableData = () => {
  pythonEditorRef.value.insertSnippet("val = vars.get('rows')[0]['${1:colunmName}']\n")
  pythonEditorRef.value.focus()
}
const setVarSnippet = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'value'
  pythonEditorRef.value.insertSnippet(`vars.put('\${1:name}', \${2:${selection}})`)
  pythonEditorRef.value.focus()
}
const setPropSnippet = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'value'
  pythonEditorRef.value.insertSnippet(`props.put('\${1:name}', \${2:${selection}})`)
  pythonEditorRef.value.focus()
}
const outputLogInfo = () => {
  const selection = pythonEditorRef.value.getSelectionValue()
  if (selection) {
    pythonEditorRef.value.insert(`log.info(f'{${selection}=}')\n`)
  } else {
    pythonEditorRef.value.insertSnippet("log.info('${1:content}')\n")
  }
  pythonEditorRef.value.focus()
}
const assertion = () => {
  pythonEditorRef.value.insertSnippet("assert ${1:condition}, '${2:message}'\n")
  pythonEditorRef.value.focus()
}
const toJson = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'object'
  pythonEditorRef.value.insertSnippet(`to_json(\${1:${selection}})`)
  pythonEditorRef.value.focus()
}
const fromJson = () => {
  let selection = pythonEditorRef.value.getSelectionValue()
  selection = selection || 'json_str'
  pythonEditorRef.value.insertSnippet(`from_json(\${1:${selection}})`)
  pythonEditorRef.value.focus()
}
const foreachList = () => {
  pythonEditorRef.value.insertSnippet('for ${2:item} in ${1:list_object}:\n    ${3:exp}')
  pythonEditorRef.value.focus()
}
const foreachDict = () => {
  pythonEditorRef.value.insertSnippet('for ${2:key}, ${3:value} in ${1:dic_object}.items():\n    ${4:exp}')
  pythonEditorRef.value.focus()
}
const listComprehensions = () => {
  pythonEditorRef.value.insertSnippet(
    'comprehensions = [${3:out_exp} for ${2:item} in ${1:list_object} if ${4:condition}]\n'
  )
  pythonEditorRef.value.focus()
}
const dictComprehensions = () => {
  pythonEditorRef.value.insertSnippet(
    'comprehensions = {${4:key}:${5:value} for ${2:key}, ${3:value} in ${1:dict_object}.items() if ${6:condition}}\n'
  )
  pythonEditorRef.value.focus()
}
</script>

<style lang="scss" scoped>
.python-editor {
  display: flex;
}

.snippet-code {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  height: 300px;
  padding-bottom: 20px;
}

.snippet-title {
  padding: 0 10px;
  font-weight: bold;
  color: #606266;
}

.snippet-list {
  padding: 10px;
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

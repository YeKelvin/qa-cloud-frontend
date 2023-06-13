<template>
  <div class="python-editor-container">
    <MonacoEditor
      ref="pythonEditor"
      v-model="localModelValue"
      class="python-editor"
      language="python"
      style="margin-bottom: 10px"
      :read-only="readOnly"
    />
    <div class="snippet-code-container">
      <span class="snippet-title">代码片段</span>
      <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;">
        <ul class="snippet-code-list">
          <li @click="getVarSnippet()">获取局部变量</li>
          <li @click="getPropSnippet()">获取全局变量</li>
          <template v-if="type == 'HTTP' && (phase == 'POST' || phase == 'ASSERTION')">
            <li @click="getResponseJsonSnippet()">获取Json响应</li>
          </template>
          <li @click="getTableData()">获取表数据</li>
          <li @click="setVarSnippet()">设置局部变量</li>
          <li @click="setPropSnippet()">设置全局变量</li>
          <li @click="outputLogInfo()">输出日志</li>
          <template v-if="phase == 'ASSERTION'">
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

<script>
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

export default defineComponent({
  components: { MonacoEditor },
  props: {
    readOnly: Boolean,
    phase: String, // PRE | SAMPLER | POST | ASSERTION
    type: String // PYTHON | HTTP
  },
  emits: ['update:modelValue'],
  computed: {
    localModelValue: {
      get() {
        return this.$attrs.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  },
  methods: {
    /**
     * 设置编辑器内容
     */
    setValue(val) {
      this.$refs.pythonEditor.setValue(val)
    },

    /**
     * 获取编辑器内容
     */
    getValue() {
      return this.$refs.pythonEditor.getValue()
    },

    getVarSnippet() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'name'
      this.$refs.pythonEditor.insertSnippet(`vars.get(\${1:${selection}})`)
      this.$refs.pythonEditor.focus()
    },
    getPropSnippet() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'name'
      this.$refs.pythonEditor.insertSnippet(`props.get(\${1:${selection}})`)
      this.$refs.pythonEditor.focus()
    },
    getResponseJsonSnippet() {
      this.$refs.pythonEditor.insert('res = result.json\n')
      this.$refs.pythonEditor.focus()
    },
    getTableData() {
      this.$refs.pythonEditor.insertSnippet("val = vars.get('rows')[0]['${1:colunmName}']\n")
      this.$refs.pythonEditor.focus()
    },
    setVarSnippet() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'value'
      this.$refs.pythonEditor.insertSnippet(`vars.put('\${1:name}', \${2:${selection}})`)
      this.$refs.pythonEditor.focus()
    },
    setPropSnippet() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'value'
      this.$refs.pythonEditor.insertSnippet(`props.put('\${1:name}', \${2:${selection}})`)
      this.$refs.pythonEditor.focus()
    },
    outputLogInfo() {
      const selection = this.$refs.pythonEditor.getSelectionValue()
      if (selection) {
        this.$refs.pythonEditor.insert(`log.info(f'{${selection}=}')\n`)
      } else {
        this.$refs.pythonEditor.insertSnippet("log.info('${1:content}')\n")
      }
      this.$refs.pythonEditor.focus()
    },
    assertion() {
      this.$refs.pythonEditor.insertSnippet("assert ${1:condition}, '${2:message}'\n")
      this.$refs.pythonEditor.focus()
    },
    toJson() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'object'
      this.$refs.pythonEditor.insertSnippet(`to_json(\${1:${selection}})`)
      this.$refs.pythonEditor.focus()
    },
    fromJson() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'json_str'
      this.$refs.pythonEditor.insertSnippet(`from_json(\${1:${selection}})`)
      this.$refs.pythonEditor.focus()
    },
    foreachList() {
      this.$refs.pythonEditor.insertSnippet('for ${2:item} in ${1:list_object}:\n    ${3:exp}')
      this.$refs.pythonEditor.focus()
    },
    foreachDict() {
      this.$refs.pythonEditor.insertSnippet('for ${2:key}, ${3:value} in ${1:dic_object}.items():\n    ${4:exp}')
      this.$refs.pythonEditor.focus()
    },
    listComprehensions() {
      this.$refs.pythonEditor.insertSnippet(
        'comprehensions = [${3:out_exp} for ${2:item} in ${1:list_object} if ${4:condition}]\n'
      )
      this.$refs.pythonEditor.focus()
    },
    dictComprehensions() {
      this.$refs.pythonEditor.insertSnippet(
        'comprehensions = {${4:key}:${5:value} for ${2:key}, ${3:value} in ${1:dict_object}.items() if ${6:condition}}\n'
      )
      this.$refs.pythonEditor.focus()
    }
  }
})
</script>

<style lang="scss" scoped>
.python-editor-container {
  display: flex;
  margin-bottom: 10px;
}

.python-editor {
  flex: 1;
}

.snippet-code-container {
  width: 140px;
  min-width: 140px;
  max-width: 140px;
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

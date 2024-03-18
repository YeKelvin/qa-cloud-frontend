<template>
  <el-dialog title="日志详情" width="80%" center @close="$emit('update:model-value', false)">
    <el-form :model="formData" label-width="100px" style="width: 100%; padding-right: 30px; margin-bottom: 40px">
      <el-form-item label="请求路由：" prop="path">
        <span>{{ formData.method }} {{ formData.path }}</span>
      </el-form-item>
      <el-form-item label="请求描述：" prop="desc">
        <span>{{ formData.desc }}</span>
      </el-form-item>
      <el-form-item label="响应状态：" prop="success">
        <span>{{ formData.success == true ? '成功' : '失败' }}</span>
      </el-form-item>
      <el-form-item label="请求数据：" prop="request">
        <MonacoEditor ref="reqRef" v-model="formData.request" language="json" style="height: 300px" :readonly="true" />
      </el-form-item>
      <el-form-item label="响应数据：" prop="response">
        <MonacoEditor ref="resRef" language="json" style="height: 300px" :readonly="true" />
      </el-form-item>
    </el-form>

    <header class="el-dialog__header" style="display: flex; justify-content: center; margin-bottom: 10px">
      <span role="heading" aria-level="2" class="el-dialog__title">数据详情</span>
    </header>

    <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
      <!-- 空数据提示 -->
      <template #empty><el-empty /></template>
      <!-- 列定义 -->
      <el-table-column prop="action" label="操作类型" min-width="100" width="100">
        <template #default="{ row }">{{ ActionType[row.action] }}</template>
      </el-table-column>
      <el-table-column prop="table" label="表格名称" min-width="250" width="250" />
      <el-table-column prop="rowid" label="数据ID" min-width="100" width="100" />
      <el-table-column prop="field" label="字段名称" min-width="200" />
      <el-table-column prop="oldValue" label="更新前数据" min-width="200" />
      <el-table-column prop="newValue" label="更新后数据" min-width="200" />
      <el-table-column fixed="right" label="操作" min-width="80" width="80" align="center">
        <template #default="{ row }">
          <el-button v-if="row.action == 'UPDATE'" type="primary" link @click="openDiff(row)">比较</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 数据对比窗口 -->
    <el-dialog
      v-model="showDiffDialog"
      class="diff-dialog"
      width="60%"
      center
      destroy-on-close
      @close="showDiffDialog = false"
    >
      <MonacoDiffEditor ref="diffEditorRef" language="json" />
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import * as DataService from '@/api/system/data'
import MonacoDiffEditor from '@/components/monaco-editor/MonacoDiffEditor.vue'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const emit = defineEmits(['update:model-value'])
const formData = inject('currentRow', null)
const tableData = ref([])
const reqRef = ref()
const resRef = ref()
const diffEditorRef = ref()
const showDiffDialog = ref()

const ActionType = {
  INSERT: '新增',
  UPDATE: '编辑',
  DELETE: '删除'
}

onMounted(() => {
  DataService.queryDataLogList({ logNo: formData.value.logNo }).then((response) => {
    tableData.value = response.data
  })
  nextTick(() => {
    setTimeout(() => {
      reqRef.value.setValue(formData.value.request)
      resRef.value.setValue(formData.value.response)
    }, 100)
  })
  nextTick(() => {
    setTimeout(() => {
      reqRef.value.formatDocument()
      resRef.value.formatDocument()
    }, 100)
  })
})

const openDiff = (row) => {
  showDiffDialog.value = true
  nextTick(() => {
    diffEditorRef.value.setOldValue(row.oldValue)
    diffEditorRef.value.setNewValue(row.newValue)
  })
}
</script>

<style lang="scss">
.diff-dialog {
  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 5px;
  }
}
</style>

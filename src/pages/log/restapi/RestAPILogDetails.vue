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
    </el-table>
  </el-dialog>
</template>

<script setup>
import * as DataService from '@/api/system/data'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const emit = defineEmits(['update:model-value'])
const formData = inject('currentRow', null)
const tableData = ref([])
const reqRef = ref()
const resRef = ref()

const ActionType = {
  INSERT: '新增',
  UPDATE: '编辑',
  DELETE: '删除'
}

onMounted(() => {
  DataService.queryDataLogList({ logNo: formData.value.logNo }).then((response) => {
    tableData.value = response.result
  })
  nextTick(() => {
    setTimeout(() => {
      reqRef.value.setValue(formData.value.request)
      resRef.value.setValue(formData.value.response)
      setTimeout(() => {
        reqRef.value.formatDocument()
        resRef.value.formatDocument()
      }, 100)
    }, 100)
  })
})
</script>

<style lang="scss" scoped></style>

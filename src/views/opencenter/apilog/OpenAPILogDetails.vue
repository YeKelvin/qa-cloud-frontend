<template>
  <el-dialog title="日志详情" width="60%" center @close="$emit('update:model-value', false)">
    <el-form label-width="100px" style="width: 100%; padding-right: 30px" :model="formData">
      <el-form-item label="请求方法：" prop="method">
        <span>{{ formData.method }}</span>
      </el-form-item>
      <el-form-item label="请求路由：" prop="path">
        <span>{{ formData.path }}</span>
      </el-form-item>
      <el-form-item label="请求描述：" prop="desc">
        <span>{{ formData.desc }}</span>
      </el-form-item>
      <el-form-item label="响应状态：" prop="success">
        <span>{{ formData.success == true ? '成功' : '失败' }}</span>
      </el-form-item>
      <el-form-item label="请求数据：" prop="request">
        <MonacoEditor ref="reqRef" v-model="formData.request" language="json" style="height: 300px" :read-only="true" />
      </el-form-item>
      <el-form-item label="响应数据：" prop="response">
        <MonacoEditor ref="resRef" language="json" style="height: 300px" :read-only="true" />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const emit = defineEmits(['update:model-value'])
const formData = inject('currentRow', null)
const reqRef = ref()
const resRef = ref()

onMounted(() => {
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

<template>
  <!-- http请求方法列表 -->
  <el-select v-model="localValue" style="width: 110px">
    <el-option label="GET" value="GET" />
    <el-option label="POST" value="POST" />
    <el-option label="PUT" value="PUT" />
    <el-option label="DELETE" value="DELETE" />
    <el-option label="PATCH" value="PATCH" />
    <el-option label="HEAD" value="HEAD" />
    <el-option label="CONNECT" value="CONNECT" />
    <el-option label="OPTIONS" value="OPTIONS" />
    <el-option label="TRACE" value="TRACE" />
  </el-select>
</template>

<script setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({ modelValue: String })
const localValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
</script>

<style lang="scss" scoped>
:deep(.el-input__validateIcon) {
  display: none;
}
</style>

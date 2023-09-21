<template>
  <div>
    <span style="font-weight: 400">名称：</span>
    <el-input v-model="localvalue" clearable />
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: String } })
const emit = defineEmits(['update:modelValue'])

const localvalue = ref(props.modelValue)

watch(localvalue, (val) => emit('update:modelValue', val))
</script>

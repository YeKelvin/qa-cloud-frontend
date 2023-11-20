<template>
  <div class="show-border">
    <div style="display: flex; align-items: center">
      <SimpleTextarea v-model="name" style="border-bottom: 0; border-radius: 0" />
      <el-select v-model="argtype" class="argument-type-select">
        <el-option label="text" value="text" />
        <el-option label="file" value="file" disabled />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'

const emit = defineEmits(['update:name', 'update:argtype'])
const props = defineProps({
  name: { type: String, required: true },
  argtype: { type: String, required: true }
})
const name = computed({
  get: () => props.name,
  set: (val) => emit('update:name', val)
})
const argtype = computed({
  get: () => props.argtype,
  set: (val) => emit('update:argtype', val)
})
</script>

<style lang="scss" scoped>
.show-border {
  background: white;
  border-bottom: 1px solid #dcdfe6;

  &:focus-within {
    border-color: #409eff;
  }
}

.argument-type-select {
  width: 68px;
  min-width: 68px;
  height: 100%;

  &.el-select {
    --el-select-disabled-border: none;
    --el-select-border-color-hover: none;
    --el-select-input-focus-border-color: none;
  }

  :deep(.el-input__inner) {
    background-color: #fff;
    box-shadow: none;
  }

  :deep(.el-input__wrapper) {
    background-color: #fff;
    box-shadow: none;
  }
}

.argument-name {
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
  white-space: pre-wrap;
}

.argument-type {
  width: 40px;
  min-width: 40px;
  padding: 0 5px;
  color: var(--el-disabled-text-color);
}
</style>

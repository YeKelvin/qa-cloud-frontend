<template>
  <div :class="{ 'show-border': !queryMode }">
    <div v-if="!queryMode" style="display: flex; align-items: center">
      <SimpleTextarea v-model="name" style="border-radius: 0; border-bottom: 0" />
      <el-select v-model="argtype" class="argument-type-select">
        <el-option label="text" value="text" />
        <el-option label="file" value="file" disabled />
      </el-select>
    </div>
    <div v-else style="display: flex; align-items: center; justify-content: space-between">
      <span class="argument-name">{{ name }}</span>
      <span class="argument-type">{{ argtype }}</span>
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
const queryMode = inject('queryMode')
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
  width: 90px;
  height: 100%;

  &.el-select {
    --el-select-disabled-border: none;
    --el-select-border-color-hover: none;
    --el-select-input-focus-border-color: none;
  }

  :deep(.el-input__inner) {
    box-shadow: none;
    background-color: #ffffff;
  }

  :deep(.el-input__wrapper) {
    box-shadow: none;
    background-color: #ffffff;
  }
}

.argument-name {
  white-space: pre-wrap;
  letter-spacing: 0.6px;
  text-overflow: ellipsis;
}

.argument-type {
  padding: 0 5px;
  width: 40px;
  min-width: 40px;
  color: var(--el-disabled-text-color);
}
</style>

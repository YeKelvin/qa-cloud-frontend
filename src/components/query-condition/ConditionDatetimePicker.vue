<template>
  <div class="condition-item">
    <label class="condition-label">{{ label }}</label>
    <el-date-picker v-model="localModelValue" type="datetime" v-bind="$attrs" />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    label: { type: String, default: '' }
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
  }
}
</script>

<style lang="scss" scoped>
.condition-item {
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;

  color: #909399;
  font-size: 14px;
  width: 20rem;
  padding-right: 24px;
  padding-bottom: 12px;
}

.condition-label {
  margin-right: 6px;
  width: fit-content;
  white-space: nowrap;
}

:deep(.el-date-editor.el-input) {
  width: inherit;
}
</style>

<template>
  <div class="condition-item">
    <label class="condition-label">{{ label }}</label>
    <el-input v-model="localModelValue" v-bind="$attrs" clearable />
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
  align-items: center;
  width: 20rem;
  padding-right: 24px;
  padding-bottom: 12px;
  font-size: 14px;
  color: #909399;
}

.condition-label {
  width: fit-content;
  margin-right: 6px;
  white-space: nowrap;
}
</style>

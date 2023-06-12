<template>
  <div class="condition-item">
    <label class="condition-label">{{ label }}</label>
    <el-select v-model="localModelValue" v-bind="$attrs" clearable>
      <el-option v-for="(value, key) in options" :key="key" :label="value" :value="key" />
    </el-select>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    label: { type: String, default: '' },
    options: { type: Object, default: () => ({}) }
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

.el-select {
  width: 100%;
}
</style>

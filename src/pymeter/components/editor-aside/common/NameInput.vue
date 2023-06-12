<template>
  <div>
    <el-input v-model="local" clearable />
  </div>
</template>

<script>
import { ElInput } from 'element-plus'

export default {
  props: {
    initial: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      local: this.initial
    }
  },
  watch: {
    local(val) {
      this.$emit('update:modelValue', val)
    }
  }
}
</script>

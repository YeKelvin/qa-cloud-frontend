<template>
  <div class="condition-wrapper">
    <!-- 关键字 -->
    <el-select v-model="rule.field" placeholder="关键字" :disabled="queryMode">
      <el-option
        v-for="option in conditionData"
        :key="option.field.value"
        :label="option.field.label"
        :value="option.field.value"
      />
    </el-select>

    <!-- 操作符 -->
    <el-select v-model="rule.operator" placeholder="操作符" :disabled="queryMode">
      <el-option label="等于（==）" value="EQUAL" />
      <el-option label="不等于（!=）" value="NOT_EQUAL" />
      <el-option label="包含（in）" value="IN" />
      <el-option label="不包含（not in）" value="NOT_IN" />
    </el-select>

    <template v-if="options">
      <el-select v-model="rule.value" :multiple="multiple" clearable :disabled="queryMode">
        <el-option v-for="option in options" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
    </template>
    <template v-else>
      <el-input v-model="rule.value" clearable :readonly="queryMode" />
    </template>

    <span style="display: flex">
      <el-button v-show="!queryMode" :icon="Plus" link @click="$emit('add')" />
      <el-button v-show="!queryMode" :icon="Minus" link @click="$emit('remove')" />
    </span>
  </div>
</template>

<script setup>
import { Plus, Minus } from '@element-plus/icons-vue'

const conditionData = inject('conditionData')
const queryMode = inject('queryMode')
const emit = defineEmits(['add', 'remove'])
const props = defineProps({
  rule: { type: Object, required: true }
})
const rule = computed(() => props.rule)
const field = computed(() => props.rule.field)
const multiple = computed(() => ['IN', 'NOT_IN'].includes(rule.value.operator))
const options = computed(() => {
  if (!field.value) return null
  return conditionData.filter((item) => item.field.value === field.value)[0].options
})

watch(field, () => {
  // eslint-disable-next-line vue/no-mutating-props
  props.rule.value = []
})
watch(multiple, (val) => {
  if (val) {
    // eslint-disable-next-line vue/no-mutating-props
    props.rule.value = []
  } else {
    // eslint-disable-next-line vue/no-mutating-props
    props.rule.value = ''
  }
})
</script>

<style lang="scss" scoped>
.condition-wrapper {
  display: flex;
  width: 100%;
}

.el-select {
  width: 100%;
  padding-right: 10px;
}

.el-input {
  width: 100%;
  padding-right: 10px;
}
</style>

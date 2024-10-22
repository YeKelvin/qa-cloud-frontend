<template>
  <el-card shadow="never">
    <template #header>
      <el-button :icon="CloseBold" link @click="$emit('remove-group')" />
    </template>
    <div class="group-wrapper">
      <div class="logic-wrapper">
        <div class="logic-top" />
        <el-select v-model="logic" class="logic-select">
          <el-option label="AND" value="AND" />
          <el-option label="OR" value="OR" />
        </el-select>
        <div class="logic-bottom" />
      </div>
      <div class="rules-wrapper">
        <div v-for="(rule, index) in rules" :key="rule" class="rule-wrapper">
          <template v-if="'logic' in rule">
            <LogicalConditionGroup
              v-model:logic="rule.logic"
              v-model:rules="rule.rules"
              @add="rule.rules.splice($event + 1, 0, { field: '', operator: 'EQUAL', value: '' })"
              @remove="rule.rules.splice($event, 1)"
              @add-group="
                rule.rules.splice(index + 1, 0, {
                  logic: 'AND',
                  rules: [
                    { field: '', operator: 'EQUAL', value: '' },
                    { field: '', operator: 'EQUAL', value: '' }
                  ]
                })
              "
              @remove-group="$emit('remove', index)"
              @auto-adjust="rules.splice(index, 1, rule.rules[0])"
            />
          </template>
          <template v-else>
            <LogicalCondition :rule="rule" @add="$emit('add', index)" @remove="$emit('remove', index)" />
          </template>
        </div>
      </div>
    </div>
    <div style="padding-left: 80px">
      <el-button type="primary" :icon="Plus" link @click="addRule">添加条件</el-button>
      <el-button type="primary" :icon="Plus" link @click="$emit('add-group')">添加条件组</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { CloseBold, Plus } from '@element-plus/icons-vue'

import LogicalCondition from '@/pymeter/components/editor-main/others/LogicalCondition.vue'

const emit = defineEmits(['add', 'remove', 'add-group', 'remove-group', 'auto-adjust', 'update:logic', 'update:rules'])
const props = defineProps({
  logic: { type: String, required: true },
  rules: { type: Array, required: true }
})
const logic = computed({
  get: () => props.logic,
  set: val => emit('update:logic', val)
})
const rules = computed({
  get: () => props.rules,
  set: val => emit('update:rules', val)
})

const addRule = () => {
  rules.value.push({ field: '', operator: 'EQUAL', value: '' })
}

// 监听条件组，如果小于2个条件时删除条件组
watch(
  () => rules.value.length,
  length => {
    if (length < 2) emit('auto-adjust')
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.el-card {
  width: 100%;
  border: 1px dashed var(--el-card-border-color);
}

.el-button {
  font-weight: 400;
}

:deep(.el-card__header) {
  display: flex;
  justify-content: end;
  padding: 4px;
  border-bottom: none;
}

:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px;
}

.group-wrapper {
  display: flex;
}

.logic-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  min-width: 80px;
  max-width: 80px;
}

.rules-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.rule-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  margin-bottom: 5px;
}

.logic-select {
  width: 70px;

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

  :deep(.el-select__icon) {
    &:first-child {
      margin-left: 0;
    }
  }
}

.logic-top {
  width: 30px;
  height: 100%;
  margin-top: 20%;
  margin-left: 20%;
  border-top: 1px var(--el-border-color) var(--el-border-style);
  border-left: 1px var(--el-border-color) var(--el-border-style);
}

.logic-bottom {
  width: 30px;
  height: 100%;
  margin-bottom: 20%;
  margin-left: 20%;
  border-bottom: 1px var(--el-border-color) var(--el-border-style);
  border-left: 1px var(--el-border-color) var(--el-border-style);
}
</style>

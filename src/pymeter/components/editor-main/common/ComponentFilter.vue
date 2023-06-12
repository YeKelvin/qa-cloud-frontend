<template>
  <template v-if="isEmpty(modelvalue)">
    <div>
      <el-button type="primary" :icon="Plus" link :disabled="queryMode" @click="addRule">添加条件</el-button>
    </div>
  </template>
  <template v-else-if="'logic' in modelvalue">
    <LogicalConditionGroup
      v-model:logic="modelvalue.logic"
      v-model:rules="modelvalue.rules"
      @add="addRule"
      @remove="removeRule"
      @add-group="addGroup"
      @remove-group="removeGroup"
      @auto-adjust="adjustRule"
    />
  </template>
  <template v-else>
    <el-card shadow="never">
      <LogicalCondition :rule="modelvalue" style="margin-bottom: 5px" @add="addRule" @remove="removeRule" />
      <div>
        <el-button v-show="!queryMode" type="primary" :icon="Plus" link @click="addRule">添加条件</el-button>
      </div>
    </el-card>
  </template>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { Plus } from '@element-plus/icons-vue'
import LogicalCondition from '@/pymeter/components/editor-main/common/LogicalCondition.vue'
import LogicalConditionGroup from '@/pymeter/components/editor-main/common/LogicalConditionGroup.vue'

const queryMode = inject('queryMode')
const attrs = useAttrs()
const emit = defineEmits(['update:modelValue'])
/**
 * [
 *   {
 *     field: {label: '', value: ''},
 *     options: [
 *       {label: '', value: ''}
 *       ...
 *     ]
 *   }
 *   ...
 * ]
 */
const props = defineProps({
  conditionData: { type: Object, required: true }
})
const modelvalue = computed({
  get: () => attrs.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const addRule = (index) => {
  if (isEmpty(modelvalue.value)) {
    modelvalue.value = { field: '', operator: 'EQUAL', value: '' }
    return
  }

  if ('logic' in modelvalue.value) {
    modelvalue.value.rules.splice(index + 1, 0, { field: '', operator: 'EQUAL', value: '' })
  } else {
    modelvalue.value = {
      logic: 'AND',
      rules: [{ ...modelvalue.value }, { field: '', operator: 'EQUAL', value: '' }]
    }
  }
}
const removeRule = (index) => {
  if ('logic' in modelvalue.value) {
    modelvalue.value.rules.splice(index, 1)
  } else {
    modelvalue.value = {}
  }
}
const addGroup = () => {
  modelvalue.value.rules.push({
    logic: 'AND',
    rules: [
      { field: '', operator: 'EQUAL', value: '' },
      { field: '', operator: 'EQUAL', value: '' }
    ]
  })
}
const removeGroup = () => {
  modelvalue.value = {}
}
const adjustRule = () => {
  modelvalue.value = modelvalue.value.rules[0]
}

provide('conditionData', props.conditionData)
</script>

<style lang="scss" scoped>
.el-card {
  width: 100%;
  padding: 10px;
  border: 1px dotted var(--el-card-border-color);
}

.el-button {
  font-weight: 400;
}

:deep(.el-card__body) {
  height: 100%;
  width: 100%;
  padding: 10px;

  display: flex;
}
</style>

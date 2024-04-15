<template>
  <el-form
    label-width="100px"
    scroll-to-error
    style="width: 100%; padding-right: 115px; padding-left: 57px; margin-top: 20px"
    :model="elementProperty"
    :rules="rules"
  >
    <!-- JsonPath表达式 -->
    <el-form-item label="JsonPath：" prop="JsonPathAssertion__jsonpath">
      <FxInput v-model="elementProperty.JsonPathAssertion__jsonpath" placeholder="$.data.key / $.data.list[0]" />
    </el-form-item>

    <!-- 判断类型 -->
    <el-form-item label="判断类型：" prop="JsonPathAssertion__operator">
      <el-select v-model="elementProperty.JsonPathAssertion__operator" style="width: 100%">
        <el-option label="等于" value="EQUAL" />
        <el-option label="不等于" value="NOT_EQUAL" />
        <el-option label="大于" value="GREATER_THAN" />
        <el-option label="小于" value="LESS_THAN" />
        <el-option label="包含" value="IN" />
        <el-option label="不包含" value="NOT_IN" />
        <el-option label="开头包含" value="START_WITH" />
        <el-option label="结尾包含" value="END_WITH" />
        <el-option label="为null" value="NULL" />
        <el-option label="不为null" value="NOT_NULL" />
        <el-option label="为空" value="BLANK" />
        <el-option label="不为空" value="NOT_BLANK" />
        <el-option label="存在" value="EXISTS" />
        <el-option label="不存在" value="NOT_EXISTS" />
        <!-- <el-option label="正则匹配" value="REGULAR" /> -->
      </el-select>
    </el-form-item>

    <!-- 期望值 -->
    <el-form-item
      v-show="
        !['NULL', 'NOT_NULL', 'BLANK', 'NOT_BLANK', 'EXISTS', 'NOT_EXISTS'].includes(
          elementProperty.JsonPathAssertion__operator
        )
      "
      label="期望值："
      prop="JsonPathAssertion__expected_value"
    >
      <FxInput v-model="elementProperty.JsonPathAssertion__expected_value" placeholder="期望值" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'

const props = defineProps({
  elementProps: Object
})
const elementProperty = computed(() => props.elementProps)
const defaultProperty = {
  JsonPathAssertion__jsonpath: '',
  JsonPathAssertion__expected_value: '',
  JsonPathAssertion__operator: 'EQUAL'
}
const rules = {
  JsonPathAssertion__jsonpath: { required: true, message: 'JsonPath表达式不能为空', trigger: 'blur' },
  JsonPathAssertion__operator: { required: true, message: '判断类型不能为空', trigger: 'blur' },
  JsonPathAssertion__expected_value: { required: true, message: '期望值不能为空', trigger: 'blur' }
}

watch(
  () => elementProperty.value.JsonPathAssertion__operator,
  (val) => {
    if (['NULL', 'NOT_NULL', 'BLANK', 'NOT_BLANK', 'EXISTS', 'NOT_EXISTS'].includes(val)) {
      elementProperty.value.JsonPathAssertion__expected_value = ''
    }
  }
)

onMounted(() => {
  Object.keys(defaultProperty).forEach((propname) => {
    if (!(propname in elementProperty.value)) {
      elementProperty.value[propname] = defaultProperty[propname]
    }
  })
})
</script>

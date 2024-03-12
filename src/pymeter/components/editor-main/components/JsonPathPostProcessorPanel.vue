<template>
  <el-form
    label-width="100px"
    scroll-to-error
    style="width: 100%; padding-right: 115px; padding-left: 70px; margin-top: 20px"
    :model="elementProperty"
    :rules="rules"
  >
    <!-- 变量名称 -->
    <el-form-item label="变量名称：" prop="JsonPathPostProcessor__variable_name">
      <FxInput v-model="elementProperty.JsonPathPostProcessor__variable_name" placeholder="存储提取值的变量名称">
        <template #prepend>
          <!-- 变量作用域 -->
          <el-select
            v-model="elementProperty.JsonPathPostProcessor__variable_scope"
            style="width: 100px; min-width: 100px"
          >
            <el-option label="局部变量" value="LOCAL" />
            <el-option label="全局变量" value="GLOBAL" />
          </el-select>
        </template>
      </FxInput>
    </el-form-item>

    <!-- JsonPath表达式 -->
    <el-form-item label="JsonPath：" prop="JsonPathPostProcessor__jsonpath">
      <FxInput v-model="elementProperty.JsonPathPostProcessor__jsonpath" placeholder="$.aa.bb[0].cc" />
    </el-form-item>

    <!-- 列表随机 -->
    <el-form-item label="列表随机：" prop="JsonPathPostProcessor__list_random">
      <el-switch
        v-model="elementProperty.JsonPathPostProcessor__list_random"
        active-value="true"
        inactive-value="false"
        inline-prompt
        :active-icon="Check"
        :inactive-icon="Close"
      />
    </el-form-item>

    <!-- 默认值 -->
    <el-form-item label="默认值：" prop="JsonPathPostProcessor__default_value">
      <FxInput v-model="elementProperty.JsonPathPostProcessor__default_value" placeholder="提取失败时使用默认值" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import FxInput from '@/pymeter/components/editor-main/others/FunctionInput.vue'
import { Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  elementProps: Object
})
const elementProperty = computed(() => props.elementProps)
const defaultProperty = {
  JsonPathPostProcessor__variable_scope: 'LOCAL',
  JsonPathPostProcessor__variable_name: '',
  JsonPathPostProcessor__jsonpath: '',
  JsonPathPostProcessor__list_random: 'false',
  JsonPathPostProcessor__default_value: ''
}
const rules = {
  JsonPathPostProcessor__variable_name: { required: true, message: '变量名称不能为空', trigger: 'blur' },
  JsonPathPostProcessor__jsonpath: { required: true, message: 'JsonPath表达式不能为空', trigger: 'blur' }
}

onMounted(() => {
  Object.keys(defaultProperty).forEach((propname) => {
    if (!(propname in elementProperty.value)) {
      elementProperty.value[propname] = defaultProperty[propname]
    }
  })
})
</script>

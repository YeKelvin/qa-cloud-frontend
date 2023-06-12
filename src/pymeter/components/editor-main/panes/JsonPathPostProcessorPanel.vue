<template>
  <el-form
    label-position="right"
    label-width="100px"
    inline-message
    scroll-to-error
    style="width: 100%; margin-top: 20px"
    :style="{
      'padding-left': props.readOnly ? '37px' : '69px',
      'padding-right': props.readOnly ? '71px' : '105px'
    }"
    :model="elementProperty"
    :rules="rules"
  >
    <!-- 变量名称 -->
    <el-form-item label="变量名称：" prop="JsonPathPostProcessor__variable_name">
      <el-input
        v-model="elementProperty.JsonPathPostProcessor__variable_name"
        placeholder="存储提取值的变量名称"
        clearable
        :readonly="props.readOnly"
      >
        <template #prepend>
          <!-- 变量作用域 -->
          <el-select
            v-model="elementProperty.JsonPathPostProcessor__variable_scope"
            style="min-width: 100px; width: 100px"
          >
            <el-option label="局部变量" value="LOCAL" />
            <el-option label="全局变量" value="GLOBAL" />
          </el-select>
        </template>
      </el-input>
    </el-form-item>

    <!-- JsonPath表达式 -->
    <el-form-item label="JsonPath：" prop="JsonPathPostProcessor__jsonpath">
      <el-input
        v-model="elementProperty.JsonPathPostProcessor__jsonpath"
        placeholder="$.aa.bb[0].cc"
        clearable
        :readonly="props.readOnly"
      />
    </el-form-item>

    <!-- 列表随机 -->
    <el-form-item label="列表随机：" prop="JsonPathPostProcessor__list_random">
      <el-switch
        v-model="elementProperty.JsonPathPostProcessor__list_random"
        active-value="true"
        inactive-value="false"
        :disabled="props.readOnly"
      />
    </el-form-item>

    <!-- 默认值 -->
    <el-form-item label="默认值：" prop="JsonPathPostProcessor__default_value">
      <el-input
        v-model="elementProperty.JsonPathPostProcessor__default_value"
        placeholder="提取失败时使用默认值"
        clearable
        :readonly="props.readOnly"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
const props = defineProps({
  readOnly: Boolean,
  elementProperty: Object
})
const elementProperty = computed(() => props.elementProperty)
const rules = {
  JsonPathPostProcessor__variable_name: { required: true, message: '变量名称不能为空', trigger: 'blur' },
  JsonPathPostProcessor__jsonpath: { required: true, message: 'JsonPath表达式不能为空', trigger: 'blur' }
}
</script>

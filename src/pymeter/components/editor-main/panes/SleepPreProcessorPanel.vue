<template>
  <el-form
    label-position="right"
    label-width="100px"
    inline-message
    scroll-to-error
    style="width: 100%; margin-top: 20px"
    :style="{
      'padding-left': props.readOnly ? '35px' : '69px',
      'padding-right': props.readOnly ? '71px' : '105px'
    }"
    :model="elementProperty"
    :rules="rules"
  >
    <!-- 延迟时间 -->
    <el-form-item label="延迟时间：" prop="SleepPreProcessor__delay">
      <el-input v-model="elementProperty.SleepPreProcessor__delay" clearable :readonly="props.readOnly">
        <template #append>ms</template>
      </el-input>
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
  SleepPreProcessor__delay: { required: true, message: '延迟时间', trigger: 'blur' }
}
</script>

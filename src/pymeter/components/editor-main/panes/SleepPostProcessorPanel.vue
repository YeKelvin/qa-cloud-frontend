<template>
  <el-form
    label-position="right"
    label-width="100px"
    inline-message
    scroll-to-error
    style="width: 100%; margin-top: 20px"
    :style="{
      'padding-left': props.readonly ? '35px' : '69px',
      'padding-right': props.readonly ? '71px' : '105px'
    }"
    :model="elementProperty"
    :rules="rules"
  >
    <!-- 延迟时间 -->
    <el-form-item label="延迟时间：" prop="SleepPostProcessor__delay">
      <el-input v-model="elementProperty.SleepPostProcessor__delay" clearable :readonly="props.readonly">
        <template #append>ms</template>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script setup>
const props = defineProps({
  readonly: Boolean,
  elementProperty: Object
})
const elementProperty = computed(() => props.elementProperty)
const defaultProperty = {
  SleepPostProcessor__delay: '0'
}
const rules = {
  SleepPostProcessor__delay: { required: true, message: '延迟时间', trigger: 'blur' }
}

onMounted(() => {
  Object.keys(defaultProperty).forEach((propname) => {
    if (!(propname in elementProperty.value)) {
      elementProperty.value[propname] = defaultProperty[propname]
    }
  })
})
</script>

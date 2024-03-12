<template>
  <el-form
    label-width="100px"
    scroll-to-error
    style="width: 100%; padding-right: 115px; padding-left: 67px; margin-top: 20px"
    :model="elementProperty"
    :rules="rules"
  >
    <!-- 延迟时间 -->
    <el-form-item label="延迟时间：" prop="SleepPostProcessor__delay">
      <FxInput v-model="elementProperty.SleepPostProcessor__delay">
        <template #append>ms</template>
      </FxInput>
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

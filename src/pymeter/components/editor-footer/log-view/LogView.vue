<template>
  <div class="log-view">
    <MonacoEditor ref="logEditorRef" language="log" :readonly="true" />
  </div>
</template>

<script setup>
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const emit = defineEmits(['update:data'])
const props = defineProps({
  data: Array
})

const logEditorRef = ref()
const logs = computed({
  get() {
    return props.data
  },
  set(val) {
    emit('update:data', val)
  }
})

onMounted(() => {
  nextTick(() => {
    logEditorRef.value.setValue(logs.value.join(''))
    logEditorRef.value.scrollToBottom()
  })
})

watch(
  logs,
  () => {
    if (!logEditorRef.value) return
    logEditorRef.value.setValue(logs.value.join(''))
    logEditorRef.value.scrollToBottom()
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.log-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>

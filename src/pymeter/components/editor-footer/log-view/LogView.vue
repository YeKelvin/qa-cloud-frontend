<template>
  <div class="log-view">
    <!-- <div class="view-header"></div> -->
    <MonacoEditor ref="logEditorRef" language="log" :read-only="true" />
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
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  width: 100%;
  padding: 10px 15px;
  padding-left: 25px;

  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

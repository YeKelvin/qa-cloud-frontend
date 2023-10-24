<template>
  <div class="pymeter-container">
    <!-- ResizeBox -->
    <div class="editor-container">
      <div class="resize-box-left">
        <div class="resize-bar-horizontal" />
        <div class="resize-line-horizontal" />
        <div class="resize-real-box">
          <!-- 编辑器侧边栏 -->
          <EditorAside class="l-container editor-aside" />
        </div>
      </div>
      <!-- 编辑器主体 -->
      <EditorMain class="resize-box-right r-container" />
    </div>
    <!-- 编辑器底部 -->
    <EditorFooter class="editor-footer" />
  </div>
</template>

<script setup>
import EditorAside from './components/editor-aside/EditorAside.vue'
import EditorMain from './components/editor-main/EditorMain.vue'
import EditorFooter from './components/editor-footer/EditorFooter.vue'
import { usePyMeterStore } from '@/store/pymeter'

const pymeterStore = usePyMeterStore()

onMounted(() => {
  pymeterStore.queryDatasetAll()
  pymeterStore.queryHttpheaderTemplateAll()
})
</script>

<style lang="scss" scoped>
.pymeter-container {
  position: absolute;
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 5px;
}

.editor-container {
  display: flex;
  flex: 1;
  width: 100%;
  height: 0;
  margin-bottom: 4px;
}

.resize-box-left {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.l-container {
  width: 100%;
  height: 100%;
}

.resize-box-right {
  flex: 1;
  margin-left: 2px;
  overflow: hidden;
}

.r-container {
  width: 100%;
  height: 100%;
}

.resize-real-box {
  position: absolute;
  inset: 0 5px 0 0;
  height: 100%;
}

.resize-bar-horizontal {
  width: 100%;
  min-width: 400px;
  max-width: 800px;
  height: 50px;
  overflow: scroll;
  cursor: col-resize;
  resize: horizontal;
  opacity: 0;
}

.resize-line-horizontal {
  position: absolute;
  right: 0;
  height: 50px;
  pointer-events: none;
  border-right: 3px double #ddd;
}

.resize-bar-horizontal:hover ~ .resize-line-horizontal,
.resize-bar-horizontal:active ~ .resize-line-horizontal {
  border-right: 3px double skyblue;
}

.resize-bar-horizontal::-webkit-scrollbar {
  width: 10px;
  height: inherit;
}
</style>

<template>
  <el-affix target=".pymeter-component-container" position="bottom" :offset="60">
    <div class="flexbox-center">
      <el-tooltip effect="light" placement="right" :content="props.tips">
        <el-button type="danger" @click="emit('click')">
          <SvgIcon icon-name="pymeter-save" style="margin-right: 5px; font-size: 20px" />
          <span>保 存</span>
        </el-button>
      </el-tooltip>
    </div>
  </el-affix>
</template>

<script setup>
const props = defineProps({
  tips: { type: String, default: '' }
})
const emit = defineEmits(['click'])
</script>

<style lang="scss" scoped></style>

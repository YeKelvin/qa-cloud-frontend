<template>
  <div class="svg-container">
    <svg style="width: 100%; height: 100%">
      <image :xlink:href="img" height="100%" width="100%" />
    </svg>
    <span style="color: #c0c0c0; font-size: 4px">
      <span style="float: right">Designed by Freepik</span>
    </span>
  </div>
</template>

<script setup>
import img from '@/assets/images/dashboard/construction.jpg'
</script>

<style lang="scss" scoped>
.svg-container {
  position: absolute;
  padding: 10px;
  height: 100%;
  width: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: column;
}
</style>

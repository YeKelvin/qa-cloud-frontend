<template>
  <div class="linear-loader" style="opacity: 1">
    <div class="linear-progress-bar indeterminate" />
  </div>
</template>

<style lang="scss" scoped>
.linear-loader {
  position: relative;
  top: -5px;
  z-index: 2;
  width: 98%;
  height: 2px;
  overflow: hidden;
}

.linear-loader .linear-progress-bar {
  position: relative;
  z-index: 2;
  height: 100%;
}

.linear-loader .indeterminate {
  animation: loader-animation 1s ease-in-out infinite;
}

.linear-loader .linear-progress-bar.indeterminate {
  width: 50%;
  background-image: linear-gradient(78deg, #fff, #ff6c37 50%, #fff);
}

@keyframes loader-animation {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(200%);
  }
}
</style>

<template>
  <div class="linear-loader" style="opacity: 1">
    <div class="linear-progress-bar indeterminate"></div>
  </div>
</template>

<style lang="scss" scoped>
.linear-loader {
  position: relative;
  overflow: hidden;
  z-index: 2;
  top: -5px;
  height: 2px;
  width: 98%;
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
  background-image: linear-gradient(78deg, #ffffff, #ff6c37 50%, #ffffff);
}

@keyframes loader-animation {
  0% {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(200%);
  }
}
</style>

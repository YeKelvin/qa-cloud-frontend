<template>
  <div style="padding: 0 15px" @click="toggleClick">
    <svg
      :class="{ 'is-active': isActive }"
      class="hamburger"
      viewBox="0 0 1126 1024"
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
    >
      <path
        d="M0 972.8h1126.4v51.2H0v-51.2z m563.2-460.8v51.2H0v-51.2h563.2z m0-460.8v51.2H0V51.2h563.2zM1054.72 332.8L768 628.6336l35.84 36.9664L1126.4 332.8 803.84 0l-35.84 36.9664z"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Hamburger',
  props: {
    isActive: { type: Boolean, default: false }
  },
  emits: ['toggleClick'],
  methods: {
    toggleClick() {
      this.$emit('toggleClick')
    }
  }
}
</script>

<style scoped>
.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

.hamburger.is-active {
  transform: rotateY(180deg);
}
</style>

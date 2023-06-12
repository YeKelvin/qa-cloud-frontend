<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script>
export default defineComponent({
  name: 'SvgIcon',
  props: {
    prefix: { type: String, default: 'icon' },
    iconName: { type: String, required: true },
    className: { type: String, default: '' }
  },
  setup(props) {
    return {
      symbolId: computed(() => `#${props.prefix}-${props.iconName}`),
      svgClass: computed(() => {
        if (props.className) {
          return `svg-icon ${props.className}`
        }
        return 'svg-icon'
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.svg-icon {
  position: relative;
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: -2px;
}
</style>

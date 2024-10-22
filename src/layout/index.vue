<template>
  <div :class="classObj" class="app-wrapper">
    <!--left side-->
    <Sidebar class="sidebar-container" />
    <!--right container-->
    <div class="main-container">
      <div :class="{ 'fixed-header': settingsStore.fixedHeader }">
        <Navbar />
      </div>
      <AppMain />
    </div>
  </div>
</template>

<script setup>
import { AppMain, Navbar, Sidebar } from './components'
import useResizeHandler from './composables/useResizeHandler'

import { useAppStore } from '@/store/app'
import { useSettingsStore } from '@/store/settings'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const classObj = computed(() => {
  return {
    hideSidebar: !appStore.sidebar.opened,
    openSidebar: appStore.sidebar.opened,
    withoutAnimation: appStore.sidebar.withoutAnimation,
    mobile: appStore.sidebar.device === 'mobile'
  }
})

watch(route, () => {
  if (appStore.sidebar.device === 'mobile' && appStore.sidebar.opened) {
    appStore.closeSideBar({ withoutAnimation: false })
  }
})

useResizeHandler()
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}
</style>

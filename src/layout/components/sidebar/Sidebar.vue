<template>
  <div id="Sidebar" :class="{ 'has-logo': showLogo }" class="sidebar-menu">
    <SidebarLogo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :unique-opened="false"
        :text-color="variables.menuText"
        :background-color="variables.menuBg"
        :active-text-color="variables.menuActiveText"
        mode="vertical"
      >
        <SidebarItem
          v-for="accessedRoute in permissionStore.routes"
          :key="accessedRoute.path"
          :item="accessedRoute"
          :base-path="accessedRoute.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import SidebarItem from './SidebarItem.vue'
import SidebarLogo from './SidebarLogo.vue'
import variables from '@/styles/variables.module.scss'

import { useAppStore } from '@/store/app'
import { usePermissionStore } from '@/store/permission'
import { useSettingsStore } from '@/store/settings'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
const settingsStore = useSettingsStore()

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const showLogo = computed(() => settingsStore.sidebarLogo)
const isCollapse = computed(() => !appStore.sidebar.opened)
</script>

<style lang="scss">
.sidebar-menu {
  .el-menu {
    border-right: none;
  }

  .el-scrollbar__wrap {
    padding-bottom: 8vh;
  }
}
</style>

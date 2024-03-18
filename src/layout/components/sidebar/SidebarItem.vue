<template>
  <template v-if="!item.hidden">
    <template v-if="showSidebarItem(item.children, item)">
      <SidebarItemLink v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <SvgIcon :icon-name="onlyOneChild.meta?.icon || item.meta?.icon" class-name="nav-icon" />
          <template #title>{{ onlyOneChild.meta?.title }}</template>
        </el-menu-item>
      </SidebarItemLink>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" teleported>
      <template v-if="item.meta" #title>
        <SvgIcon :icon-name="item.meta?.icon" class-name="nav-icon" />
        <span>{{ item.meta.title }}</span>
      </template>
      <SidebarItem
        v-for="child in item.children"
        v-bind="$attrs"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </template>
</template>

<script setup>
import path from 'path'

import SidebarItemLink from './SidebarItemLink.vue'
</script>

<script>
import { isExternal } from '@/utils/validate'

export default {
  name: 'SidebarItem',
  inheritAttrs: false,
  props: {
    item: { type: Object, required: true },
    isNest: { type: Boolean, default: false },
    basePath: { type: String, default: '' }
  },
  data() {
    return {
      onlyOneChild: null
    }
  },
  methods: {
    showSidebarItem(children = [], parent) {
      const showingChildren = children.filter((item) => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })
      if (showingChildren.length === 1 && !parent?.alwaysShow) {
        return true
      }
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noChildren: true }
        return true
      }
      return false
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-icon {
  display: inline-block;
  font-size: 16px;
}
</style>

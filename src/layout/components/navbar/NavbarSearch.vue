<template>
  <div :class="{ show: show }" class="header-search">
    <SvgIcon class-name="search-icon" icon-name="navbar-search" @click.stop="click" />
    <el-select
      ref="headerSearchSelectRef"
      v-model="search"
      remote
      filterable
      default-first-option
      class="header-search-select"
      :remote-method="querySearch"
      @change="change"
    >
      <el-option
        v-for="option in options"
        :key="option.item.path"
        :value="option.item"
        :label="option.item.title.join(' > ')"
      />
    </el-select>
  </div>
</template>

<script setup>
// fuse is a lightweight fuzzy-search module
// make search results more in line with expectations
import path from 'path'

import Fuse from 'fuse.js'

import { usePermissionStore } from '@/store/permission'

const router = useRouter()
const permissionStore = usePermissionStore()
const search = ref('')
const options = ref([])
const searchPool = ref([])
const show = ref(false)
const fuse = ref(undefined)
const headerSearchSelectRef = ref()

const routes = computed(() => permissionStore.routes)

watch(routes, () => {
  searchPool.value = generateRoutes(routes.value)
})
watch(searchPool, (list) => {
  initFuse(list)
})
watch(show, (value) => {
  if (value) {
    document.body.addEventListener('click', close)
  } else {
    document.body.removeEventListener('click', close)
  }
})

onMounted(() => {
  searchPool.value = generateRoutes(routes.value)
})

const click = () => {
  show.value = !show.value
  if (show.value) {
    headerSearchSelectRef.value && headerSearchSelectRef.value.focus()
  }
}

const close = () => {
  headerSearchSelectRef.value && headerSearchSelectRef.value.blur()
  options.value = []
  show.value = false
}

const change = (val) => {
  router.push(val.path)
  search.value = ''
  options.value = []
  nextTick(() => {
    show.value = false
  })
}

const initFuse = (list) => {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      {
        name: 'title',
        weight: 0.7
      },
      {
        name: 'path',
        weight: 0.3
      }
    ]
  })
}

// Filter out the routes that can be displayed in the sidebar
// And generate the internationalized title
const generateRoutes = (routes, basePath = '/', prefixTitle = []) => {
  let res = []

  for (const router of routes) {
    // skip hidden router
    if (router.hidden) {
      continue
    }

    const data = {
      path: path.resolve(basePath, router.path),
      title: [...prefixTitle]
    }

    if (router.meta && router.meta.title) {
      data.title = [...data.title, router.meta.title]

      if (router.redirect !== 'noRedirect') {
        // only push the routes with title
        // special case: need to exclude parent router without redirect
        res.push(data)
      }
    }

    // recursive child routes
    if (router.children) {
      const tempRoutes = generateRoutes(router.children, data.path, data.title)
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes]
      }
    }
  }
  return res
}

const querySearch = (query) => {
  options.value = query !== '' ? fuse.value.search(query) : []
}
</script>

<style lang="scss" scoped>
.header-search {
  font-size: 0 !important;

  .search-icon {
    font-size: 18px;
    vertical-align: middle;
    cursor: pointer;
  }

  .header-search-select {
    width: 0;
    overflow: hidden;
    font-size: 18px;
    vertical-align: middle;
    background: transparent;
    border-radius: 0;
    transition: width 0.2s;

    :deep(.el-input__wrapper) {
      --el-select-input-focus-border-color: none;
    }

    :deep(.el-input__inner) {
      --el-select-input-focus-border-color: #fff;

      padding-right: 0;
      padding-left: 0;
      vertical-align: middle;
      border: 0;
      border-bottom: 1px solid #d9d9d9;
      border-radius: 0;
      box-shadow: none !important;
    }
  }

  &.show {
    .header-search-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}
</style>

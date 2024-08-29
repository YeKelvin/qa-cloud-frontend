<template>
  <div />
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

defineOptions({
  name: 'Redirect'
})

const route = useRoute()
const router = useRouter()

const { params, query } = unref(route)
const { path } = params

const _path_ = Array.isArray(path) ? path.join('/') : path

router.replace({
  path: `/${_path_}`,
  query
})
</script>

<template>
  <div class="func-list">
    <!-- 搜索 -->
    <el-input
      v-model="keywords"
      placeholder="搜索函数"
      clearable
      style="padding: 0 10px; margin-bottom: 10px"
      :suffix-icon="Search"
    />
    <!-- 列表 -->
    <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding: 0 10px;">
      <el-collapse v-model="activeModules" style="margin-bottom: 100px">
        <el-collapse-item v-for="module in functionData" :key="module.code" :name="module.code" :title="module.name">
          <div
            v-for="func in module.func"
            :key="func.code"
            class="func-item"
            :class="{ active: activeFunc === func.code }"
            @click="onClick(func)"
          >
            {{ func.name }}
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'

const emit = defineEmits(['click'])
const props = defineProps({
  data: { type: Array, required: true }
})
const keywords = ref('')
const activeFunc = ref(props.data[0]?.code)
const activeModules = ref([props.data[0].code])
const onClick = (func) => {
  activeFunc.value = func.code
  emit('click', func)
}
const functionData = computed(() => {
  if (isEmpty(keywords.value)) return props.data
  const filteredText = keywords.value.toLowerCase()
  const data = props.data
  const filtereddata = []
  for (const module of data) {
    const func = module.func.filter((func) => {
      return func.name.toLowerCase().includes(filteredText) || func.desc.includes(filteredText)
    })
    if (func.length > 0) {
      filtereddata.push({
        name: module.name,
        code: module.code,
        func: func
      })
      if (!activeModules.value.includes(module.code)) activeModules.value.push(module.code)
    }
  }
  return filtereddata
})
</script>

<style lang="scss" scoped>
.func-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.func-item {
  padding: 5px 10px;
  font-size: 16px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  user-select: none;
  border-radius: 2px;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

.active {
  background-color: var(--el-color-primary-light-9);
}
</style>

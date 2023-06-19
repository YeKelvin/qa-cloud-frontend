<template>
  <div class="result-view">
    <template v-if="isEmpty(tabs)">
      <div class="view-empty">
        <SvgIcon icon-name="undraw-online-test" style="font-size: 200px" />
      </div>
    </template>
    <template v-else>
      <div class="view-header">
        <el-tabs v-model="activeTabNo" closable @tab-click="handleTabClick" @tab-remove="handleTabRemove">
          <el-tab-pane v-for="tab in tabs" :key="tab.id" :name="tab.id">
            <template #label>
              <div class="tab-label-wrapper">
                <SvgIcon v-if="tab.running" icon-name="pymeter-running" class="running-icon" />
                <span style="display: flex; flex-direction: column">
                  <span style="font-size: 12px; font-weight: 300">{{ tab.startTime }}</span>
                  <span>{{ tab.name }}</span>
                </span>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="view-body">
        <ResultCollector v-if="!activeTabLoading" :workers="activeTabDetails" />
        <el-skeleton v-else :rows="6" style="padding: 40px" animated />
      </div>
    </template>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import ResultCollector from './ResultCollector.vue'

const emit = defineEmits(['update:data'])
const props = defineProps({
  data: Array
})
const tabs = computed({
  get: () => props.data,
  set: (val) => emit('update:data', val)
})

const activeTabNo = ref(null)
const activeTabData = ref(null)
const activeTabDetails = computed(() => (!isEmpty(activeTabData.value) ? activeTabData.value.details : []))
const activeTabLoading = computed(() => (!isEmpty(activeTabData.value) ? activeTabData.value.loading : false))

watch(
  () => tabs.value.length,
  (length) => {
    if (length === 0) {
      activeTabNo.value = null
      activeTabData.value = null
      return
    }
    const tab = !isEmpty(tabs.value) ? tabs.value[length - 1] : null
    activeTabNo.value = tab ? tab.id : ''
    activeTabData.value = tab
  },
  {
    immediate: true
  }
)

/**
 * el-tab handler
 */
const handleTabClick = (tab) => {
  const result = tabs.value.find((result) => result.id === tab.paneName)
  if (!result) return
  activeTabData.value = result
}

/**
 * el-tab handler
 */
const handleTabRemove = (tabName) => {
  if (activeTabNo.value === tabName) {
    for (let i = 0; i < tabs.value.length; i++) {
      const tab = tabs.value[i]
      if (tab.id === tabName) {
        const nextTab = tabs.value[i + 1] || tabs.value[i - 1]
        if (nextTab) {
          activeTabNo.value = nextTab.id
          activeTabData.value = nextTab
        }
      }
    }
  }
  const index = tabs.value.findIndex((result) => result.id === tabName)
  if (index > -1) tabs.value.splice(index, 1)
}
</script>

<style lang="scss" scoped>
.view-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.result-view {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  width: 100%;
  display: flex;
  margin-bottom: 10px;
}

.view-body {
  width: 100%;
  height: 100%;
  display: flex;
}

.tab-label-wrapper {
  display: flex;
  align-items: center;

  padding: 0 5px;
}

.running-icon {
  font-size: 24px;
  margin-right: 5px;
}

:deep(.el-tabs) {
  --el-tabs-header-height: 41px;
  width: 100%;
  padding: 0 20px;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav-wrap) {
  &:after {
    height: 1px;
  }
}

:deep(.el-tabs__item) {
  padding: 0;
  padding-right: 20px;
}

:deep(.el-tabs__active-bar) {
  height: 1px;
}
</style>

<template>
  <div class="workspace-settings">
    <a-split v-model:size="size" class="setting-split" min="200px" max="400px">
      <template #resize-trigger>
        <div class="resizebox-line-wrapper">
          <div class="resizebox-line" />
        </div>
      </template>
      <!-- 侧边栏 -->
      <template #first>
        <a-typography-paragraph>
          <div class="setting-aside">
            <!-- 通用设置 -->
            <div class="option option__lv1">
              <SvgIcon icon-name="pymeter-setting" style="margin-right: 5px; font-size: 18px" />
              <span>通用设置</span>
            </div>
            <div class="option option__lv2" @click="openWorkspaceInfo()">空间信息</div>
            <!-- 脚本设置 -->
            <div class="option option__lv1">
              <SvgIcon icon-name="pymeter-script2" style="margin-right: 5px; font-size: 18px" />
              <span>脚本设置</span>
            </div>
            <div class="option option__lv2" @click="openHTTPHeaderTemplateManager()">请求头模板</div>
            <div class="option option__lv2" @click="openDatabaseConnectionManager()">数据库连接</div>
          </div>
        </a-typography-paragraph>
      </template>
      <!-- 主体内容 -->
      <template #second>
        <a-typography-paragraph>
          <template v-if="isEmpty(workspaceStore.workspaceNo)">
            <a-result title="请选择工作空间" status="warning" style="margin-top: 100px" />
          </template>
          <template v-else>
            <div class="setting-body">
              <div class="body-title">{{ mainTitle }}</div>
              <el-divider />
              <div class="body-main">
                <component :is="components[mainComponent]" />
              </div>
            </div>
          </template>
        </a-typography-paragraph>
      </template>
    </a-split>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { useWorkspaceStore } from '@/store/workspace'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const size = ref('200px')
const mainComponent = ref('workspace-info')
const mainTitle = computed(() => {
  return {
    'workspace-info': '空间信息',
    'httpheader-template': '请求头模板',
    'httpheader-template-manager': '请求头模板',
    'database-connection': '数据库连接',
    'database-connection-manager': '数据库连接'
  }[mainComponent.value]
})

const components = reactive({
  'workspace-info': markRaw(defineAsyncComponent(() => import('./WorkspaceInfo.vue'))),
  'httpheader-template': markRaw(defineAsyncComponent(() => import('./HTTPHeaderTemplate.vue'))),
  'httpheader-template-manager': markRaw(defineAsyncComponent(() => import('./HTTPHeaderTemplateManager.vue'))),
  'database-connection': markRaw(defineAsyncComponent(() => import('./DatabaseConnection.vue'))),
  'database-connection-manager': markRaw(defineAsyncComponent(() => import('./DatabaseConnectionManager.vue')))
})

onMounted(() => {
  if (!isEmpty(route.query.item)) {
    mainComponent.value = route.query.item
  }
})

watch(
  () => route.query.item,
  (item) => {
    if (!item) return
    mainComponent.value = item
  }
)

const openWorkspaceInfo = () => {
  router.replace({ query: { item: 'workspace-info' } })
}

const openHTTPHeaderTemplateManager = () => {
  router.replace({ query: { item: 'httpheader-template-manager' } })
}

const openDatabaseConnectionManager = () => {
  router.replace({ query: { item: 'database-connection-manager' } })
}
</script>

<style lang="scss" scoped>
.workspace-settings {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  padding: 10px;
  color: var(--el-text-color-primary);
}

.setting-split {
  width: 100%;
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.setting-aside {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 60px 20px;
  background: var(--el-bg-color-page);
}

.setting-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px 40px;
}

.option {
  display: flex;
  align-items: center;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
}

.option__lv1 {
  margin-top: 20px;
  color: var(--el-text-color-regular);
  user-select: none;

  &:first-child {
    margin-top: 0;
  }
}

.option__lv2 {
  padding-left: 33px;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary) !important;
    background-color: var(--el-color-primary-light-9) !important;
  }
}

.body-title {
  font-size: 20px;
  user-select: none;
}

.resizebox-line-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.resizebox-line {
  flex: 1;
  width: 1px;
  height: 100%;
  background-color: var(--el-border-color);

  &:hover {
    background-color: var(--el-color-primary);
  }
}

:deep(.arco-split-pane) {
  display: flex;
}

:deep(.arco-typography) {
  flex: 1;
  margin-top: 0;
  margin-bottom: 0;
}

:deep(.arco-result-icon-tip) {
  width: 80px;
  height: 80px;

  & > svg {
    font-size: 40px;
  }
}

:deep(.arco-result-title) {
  font-size: 18px;
  color: var(--el-text-color-primary);
}
</style>

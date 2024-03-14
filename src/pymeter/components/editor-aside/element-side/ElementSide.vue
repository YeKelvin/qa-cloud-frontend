<template>
  <div class="manager-container">
    <!-- 骨架屏 -->
    <el-skeleton v-if="loading" :rows="10" style="padding: 10px" animated />

    <!-- 脚本集合列表 -->
    <span v-if="!loading" class="collection-list-container">
      <el-select
        ref="elSelectRef"
        v-model="selectedScripts"
        style="flex-grow: 1"
        tag-type="danger"
        size="large"
        multiple
        clearable
        filterable
        collapse-tags
        collapse-tags-tooltip
        :teleported="false"
        :max-collapse-tags="2"
        @change="() => elSelectRef.blur()"
      >
        <!-- 下拉框底部的操作按钮 -->
        <template #footer>
          <div class="flexbox-center">
            <el-button type="primary" plain :icon="Plus" @click.stop="openNewCollectionTab()">新增集合</el-button>
            <el-button type="primary" plain :icon="Plus" @click.stop="openNewSnippetTab()">新增片段</el-button>
          </div>
        </template>

        <!-- 脚本集合 -->
        <el-option-group v-if="!isEmpty(collectionList)" key="collections" label="集合">
          <el-option
            v-for="collection in collectionList"
            :key="collection.elementNo"
            :label="collection.elementName"
            :value="collection.elementNo"
          >
            <!-- 脚本名称 -->
            <span style="float: left">{{ collection.elementName }}</span>

            <!-- 脚本禁用标识 -->
            <span style="float: right">
              <el-tag
                v-if="!collection.enabled"
                type="danger"
                size="small"
                style="margin-left: 10px"
                disable-transitions
              >
                已禁用
              </el-tag>
            </span>
          </el-option>
        </el-option-group>

        <!-- 测试片段 -->
        <el-option-group v-if="!isEmpty(snippetList)" key="snippets" label="片段" style="padding-bottom: 50px">
          <el-option
            v-for="snippet in snippetList"
            :key="snippet.elementNo"
            :label="snippet.elementName"
            :value="snippet.elementNo"
          >
            <!-- 脚本名称 -->
            <span>{{ snippet.elementName }}</span>
          </el-option>
        </el-option-group>
      </el-select>
    </span>

    <!-- 选择脚本后才显示 -->
    <template v-if="!loading && !isEmpty(selectedScripts)">
      <!-- 元素操作按钮 -->
      <div class="operation-container" style="margin-top: 5px">
        <!-- 展开节点按钮 -->
        <el-button type="primary" link @click="expandAll(true)">
          <SvgIcon icon-name="pymeter-expand-all" />
          展开
        </el-button>
        <el-divider direction="vertical" />
        <!-- 收起节点按钮 -->
        <el-button type="primary" link @click="expandAll(false)">
          <SvgIcon icon-name="pymeter-collapse-all" />
          收起
        </el-button>
        <el-divider direction="vertical" />
        <!-- 刷新脚本按钮 -->
        <el-button type="primary" link @click="queryElementsTree()">
          <SvgIcon icon-name="pymeter-refresh" />
          刷新
        </el-button>
      </div>
      <!-- 分割线 -->
      <el-divider />
      <!-- 脚本内容 -->
      <el-scrollbar
        ref="elScrollbarRef"
        style="width: 100%; height: 100%"
        wrap-style="overflow-x:auto;"
        view-style="padding:10px;"
      >
        <ElementTree ref="elementTreeRef" :scripts="selectedScripts" />
      </el-scrollbar>
    </template>

    <!-- 没有选择脚本时给出提示 -->
    <template v-if="!loading && isEmpty(selectedScripts)">
      <el-empty style="height: 100%; padding-top: 0; padding-bottom: 120px">
        <el-button link type="primary" style="font-size: 16px" :icon="Open" @click="openScriptSelect()">
          打开脚本
        </el-button>
      </el-empty>
    </template>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import { Plus, Open } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'
import ElementTree from './ElementTree.vue'

const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

const elSelectRef = ref()
const loading = ref(false)
const collectionList = ref([])
const snippetList = ref([])
const elementTreeRef = ref()
const elScrollbarRef = ref()
const selectedScripts = computed({
  get: () => pymeterStore.selectedScripts,
  set: (val) => {
    if (!loading.value) pymeterStore.selectedScripts = val
  }
})

watch(
  () => workspaceStore.workspaceNo,
  (val) => {
    if (!val) return
    // 重新查询集合列表
    queryCollections()
    // 清空已选择的集合
    selectedScripts.value = []
  }
)
watch(
  () => pymeterStore.flagAsRefreshElementRootList,
  () => queryCollections()
)
watch(
  () => pymeterStore.flagAsScrollToElementTreeBottom,
  () => scrollToBottom()
)

onMounted(async () => {
  // 没有选择工作空间时，清空已选择的集合列表
  if (!workspaceStore.workspaceNo) {
    selectedScripts.value = []
    return
  }
  // 查询集合列表
  await queryCollections()
})

/**
 * 手动打开脚本下拉框
 */
const openScriptSelect = () => {
  elSelectRef.value.focus()
  elSelectRef.value.$el.click()
}

/**
 * 滚动至底部
 */
const scrollToBottom = () => {
  const scrollbar = elScrollbarRef.value
  scrollbar && scrollbar.wrap$ && scrollbar.setScrollTop(scrollbar.wrap$.clientHeight)
}

/**
 * 根据工作空间编号查询测试集合和测试片段
 */
const queryCollections = async () => {
  // 加载中
  loading.value = true
  // 查询 TestCollection
  collectionList.value = (
    await ElementService.queryElementAll({
      workspaceNo: workspaceStore.workspaceNo,
      elementType: 'COLLECTION',
      elementClass: 'TestCollection'
    })
  ).data
  // 查询 TestSnippet
  snippetList.value = (
    await ElementService.queryElementAll({
      workspaceNo: workspaceStore.workspaceNo,
      elementType: 'SNIPPET',
      elementClass: 'TestSnippet'
    })
  ).data
  // 加载完成
  loading.value = false
  // 提取集合编号
  const collections = [...collectionList.value, ...snippetList.value].map((item) => item.elementNo)
  // 遍历取消选择无效的集合
  const selecteds = selectedScripts.value
  for (let i = selecteds.length - 1; i >= 0; i--) {
    if (!collections.includes(selecteds[i])) {
      selectedScripts.value.splice(i, 1)
    }
  }
}

/**
 * 根据集合编号查询测试用例
 */
const queryElementsTree = () => {
  elementTreeRef.value.queryElementsTree()
}

/**
 * 打开新增 TestCollection 的标签页
 */
const openNewCollectionTab = () => {
  // 打开新的标签页
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '测试集合',
    editorComponent: 'TestCollection',
    editorMode: 'CREATE',
    metadata: {
      name: '测试集合',
      component: 'TestCollection'
    }
  })
  // 隐藏下拉菜单
  elSelectRef.value.blur()
}

/**
 * 打开新增 TestSnippet 的标签页
 */
const openNewSnippetTab = () => {
  // 打开新的标签页
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '测试片段',
    editorComponent: 'TestSnippet',
    editorMode: 'CREATE',
    metadata: {
      name: '测试片段',
      component: 'TestSnippet'
    }
  })
  // 隐藏下拉菜单
  elSelectRef.value.blur()
}

/**
 * 展开或收起所有节点
 */
const expandAll = (expand) => {
  elementTreeRef.value.expandAll(expand)
}
</script>

<style lang="scss" scoped>
.manager-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .el-divider--horizontal {
    width: 95%;
    margin: 5px 10px;
  }
}

.collection-list-container {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
}

.operation-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;

  .el-button--text {
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .svg-icon {
    margin-right: 5px;
  }
}

:deep(.el-select-dropdown__wrap) {
  max-height: 400px;
}

:deep(.el-select-group__title) {
  font-size: 14px;
  font-weight: bold;
}

:deep(.el-empty__description) {
  display: none;
}
</style>

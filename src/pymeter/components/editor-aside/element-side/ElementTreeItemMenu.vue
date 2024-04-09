<template>
  <el-popover
    ref="elpopoverRef"
    v-model:visible="visible"
    trigger="click"
    virtual-triggering
    popper-class="element-menu-popover"
    transition="el-zoom-in-top"
    :hide-after="50"
    :popper-options="{ removeOnDestroy: true }"
  >
    <div style="display: flex; flex-direction: column">
      <!-- workers 二级菜单 -->
      <el-popover
        v-if="item?.elementClass == 'TestCollection'"
        v-model:visible="workersVisible"
        trigger="hover"
        placement="right-start"
        popper-class="element-menu-popover"
        transition="el-zoom-in-top"
        :hide-after="50"
        :offset="10"
      >
        <template #reference>
          <el-button link class="element-menu--top-option" @click="workersVisible = true">
            <span>新增用例</span>
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </template>
        <el-button link @click="openNewWorkerTab">测试用例</el-button>
        <el-button link @click="openNewSetupWorkerTab">前置用例</el-button>
        <el-button link @click="openNewTeardownWorkerTab">后置用例</el-button>
      </el-popover>

      <!-- samplers 二级菜单 -->
      <el-popover
        v-if="showSamplers"
        v-model:visible="samplersVisible"
        trigger="hover"
        placement="right-start"
        popper-class="element-menu-popover"
        transition="el-zoom-in-top"
        :hide-after="50"
        :offset="10"
      >
        <template #reference>
          <el-button link class="element-menu--top-option" @click="samplersVisible = true">
            <span>新增请求</span>
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </template>
        <el-button link @click="openNewHttpSamplerTab">HTTP请求</el-button>
        <el-button link @click="openNewPythonSamplerTab">Python请求</el-button>
        <el-button link @click="openNewSnippetSamplerTab">片段请求</el-button>
        <el-button link @click="openNewSQLSamplerTab">数据库请求</el-button>
      </el-popover>

      <!-- controllers -->
      <el-popover
        v-if="showControllers"
        v-model:visible="controllersVisible"
        trigger="hover"
        placement="right-start"
        popper-class="element-menu-popover"
        transition="el-zoom-in-top"
        :hide-after="50"
        :offset="10"
      >
        <template #reference>
          <el-button link class="element-menu--top-option" @click="controllersVisible = true">
            <span>新增控制器</span>
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </template>
        <el-button link @click="openNewIfControllerTab">IF分支</el-button>
        <el-button link @click="openNewLoopControllerTab">Loop循环</el-button>
        <el-button link @click="openNewWhileControllerTab">While循环</el-button>
        <el-button link @click="openNewForeachControllerTab">Foreach循环</el-button>
        <el-button link @click="openNewRetryControllerTab">重试循环</el-button>
      </el-popover>

      <template v-if="['COLLECTION', 'SNIPPET'].includes(item?.elementType)">
        <el-divider />
        <el-button link @click="copyElementToWorkspace">克隆</el-button>
        <el-button link @click="moveElementToWorkspace">移动</el-button>
      </template>
      <template v-else>
        <el-divider v-if="item?.elementType != 'SAMPLER'" />
        <!-- 复制按钮 -->
        <el-button link class="element-menu--shortcut-option" @click="duplicateElement">
          <span>复制</span>
          <el-tag type="info" size="small" disable-transitions>{{ shortcutKeyPrefix }}+D</el-tag>
        </el-button>
      </template>
      <el-divider />

      <template v-if="!['COLLECTION', 'SNIPPET'].includes(item?.elementType)">
        <!-- 启用按钮 -->
        <template v-if="!item?.enabled || item?.skiped">
          <el-button link @click="enableElement">启用</el-button>
        </template>
        <!-- 禁用按钮 -->
        <template v-if="item?.enabled">
          <el-button link @click="disableElement">禁用</el-button>
        </template>
        <!-- 跳过按钮 -->
        <template v-if="!item?.skiped">
          <el-button link @click="skipElement">跳过</el-button>
        </template>
        <el-divider />
      </template>

      <!-- 删除按钮 -->
      <el-button link class="element-menu--shortcut-option" @click="removeElement">
        <span>删除</span>
        <el-tag type="info" size="small" disable-transitions>⌫</el-tag>
      </el-button>
    </div>
  </el-popover>
</template>

<script lang="jsx" setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

import * as ElementService from '@/api/script/element'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'
import { usePyMeterStore } from '@/store/pymeter'
import { usePyMeterDB } from '@/store/pymeter-db'
import { useWorkspaceStore } from '@/store/workspace'

const attrs = useAttrs()
const offlineDB = usePyMeterDB().offlineDB
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

const emit = defineEmits(['update:visible'])
const props = defineProps({
  node: Object
})

const node = computed(() => props.node)
const item = computed(() => props.node?.data)
const elpopoverRef = ref()
const visible = computed({
  get() {
    return attrs.visible
  },
  set(val) {
    emit('update:visible', val)
  }
})
const workersVisible = ref(false)
const samplersVisible = ref(false)
const controllersVisible = ref(false)
const showSamplers = computed(() => {
  if (!item.value) return
  return ['SNIPPET', 'WORKER', 'CONTROLLER'].includes(item.value.elementType)
})
const showControllers = computed(() => {
  if (!item.value) return
  return ['SNIPPET', 'WORKER', 'CONTROLLER'].includes(item.value.elementType)
})
const isMacOS = computed(() => /macintosh|mac os x/i.test(navigator.userAgent))
const shortcutKeyPrefix = computed(() => {
  const macos = isMacOS.value
  if (macos) return '⌘'
  return 'Ctrl'
})

const closeMenu = () => {
  workersVisible.value = false
  samplersVisible.value = false
  controllersVisible.value = false
  visible.value = false
}

const getElementPath = (node) => {
  if (!node) return
  if (node.level === 1) return node.label

  let parent = node.parent
  const paths = [node.label]
  while (parent.level > 0) {
    paths.push(parent.label)
    parent = parent.parent
  }
  return `/ ${paths.reverse().join(' / ')}`
}

/**
 * 打开新增 TestWorker 的标签页
 */
const openNewWorkerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '测试用例',
    editorComponent: 'TestWorker',
    editorMode: 'CREATE',
    metadata: {
      name: '测试用例',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'TestWorker'
    }
  })
}

/**
 * 打开新增 SetupWorker 的标签页
 */
const openNewSetupWorkerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '前置用例',
    editorComponent: 'SetupWorker',
    editorMode: 'CREATE',
    metadata: {
      name: '前置用例',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'SetupWorker'
    }
  })
}

/**
 * 打开新增 TeatdownWorker 的标签页
 */
const openNewTeardownWorkerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '后置用例',
    editorComponent: 'TeardownWorker',
    editorMode: 'CREATE',
    metadata: {
      name: '后置用例',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'TeardownWorker'
    }
  })
}

/**
 * 打开新增 HttpSampler 的标签页
 */
const openNewHttpSamplerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: 'HTTP请求',
    editorComponent: 'HTTPSampler',
    editorMode: 'CREATE',
    metadata: {
      name: 'HTTP请求',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'HTTPSampler'
    }
  })
}

/**
 * 打开新增 PythonSampler 的标签页
 */
const openNewPythonSamplerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: 'Python请求',
    editorComponent: 'PythonSampler',
    editorMode: 'CREATE',
    metadata: {
      name: 'Python请求',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'PythonSampler'
    }
  })
}

/**
 * 打开新增 SQLSampler 的标签页
 */
const openNewSQLSamplerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '数据库请求',
    editorComponent: 'SQLSampler',
    editorMode: 'CREATE',
    metadata: {
      name: '数据库请求',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'SQLSampler'
    }
  })
}

/**
 * 打开新增 SnippetSampler 的标签页
 */
const openNewSnippetSamplerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '片段请求',
    editorComponent: 'SnippetSampler',
    editorMode: 'CREATE',
    metadata: {
      name: '片段请求',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'SnippetSampler'
    }
  })
}

/**
 * 打开新增 IfController 的标签页
 */
const openNewIfControllerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: 'IF分支',
    editorComponent: 'IfController',
    editorMode: 'CREATE',
    metadata: {
      name: 'IF分支',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'IfController'
    }
  })
}

/**
 * 打开新增 ForeachController 的标签页
 */
const openNewForeachControllerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: 'Foreach循环',
    editorComponent: 'ForeachController',
    editorMode: 'CREATE',
    metadata: {
      name: 'Foreach循环',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'ForeachController'
    }
  })
}

/**
 * 打开新增 LoopController 的标签页
 */
const openNewLoopControllerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: 'Loop循环',
    editorComponent: 'LoopController',
    editorMode: 'CREATE',
    metadata: {
      name: 'Loop循环',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'LoopController'
    }
  })
}

/**
 * 打开新增 RetryController 的标签页
 */
const openNewRetryControllerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '重试循环',
    editorComponent: 'RetryController',
    editorMode: 'CREATE',
    metadata: {
      name: '重试循环',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'RetryController'
    }
  })
}

/**
 * 打开新增 TransactionController 的标签页
 */
const openNewTransactionControllerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '事务',
    editorComponent: 'TransactionController',
    editorMode: 'CREATE',
    metadata: {
      name: '事务',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'TransactionController'
    }
  })
}

/**
 * 打开新增 WhileController 的标签页
 */
const openNewWhileControllerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: 'While循环',
    editorComponent: 'WhileController',
    editorMode: 'CREATE',
    metadata: {
      name: 'While循环',
      path: getElementPath(node.value),
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo,
      component: 'WhileController'
    }
  })
}

/**
 * 复制元素
 */
const duplicateElement = () => {
  closeMenu()
  const data = item.value
  if (data.elementType === 'COLLECTION') return
  // 复制 worker 时需要二次确认
  if (data.elementType === 'WORKER' || data.elementType === 'CONTROLLER') {
    ElMessageBox.confirm(null, {
      type: 'warning',
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      title: '警告',
      message: (
        <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
          是否确定复制 <b style="font-size: 16px">{data.elementName}</b> ？
        </span>
      )
    }).then(() => {
      ElementService.duplicateElement({ elementNo: data.elementNo }).then(() => {
        // 重新查询列表
        pymeterStore.refreshElementTree()
        // 成功提示
        ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
      })
    })
    // 非 worker 元素直接复制
  } else {
    ElementService.duplicateElement({ elementNo: data.elementNo }).then(() => {
      // 重新查询列表
      pymeterStore.refreshElementTree()
      // 成功提示
      ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
    })
  }
}

/**
 * 克隆元素至指定空间
 */
const copyElementToWorkspace = async () => {
  const data = item.value
  closeMenu()
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={data.elementNo}
        data={workspaceStore.workspaceList.filter((item) => item.workspaceNo !== workspaceStore.workspaceNo)}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确 定',
    cancelButtonText: '取 消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制元素到指定的空间
  await ElementService.copyElementToWorkspace({ elementNo: data.elementNo, workspaceNo: workspaceNo })
  // 成功提示
  ElMessage({ message: '克隆成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 移动元素至指定空间
 */
const moveElementToWorkspace = async () => {
  const data = item.value
  closeMenu()
  let workspaceNo = null
  // 弹出选择空间的对话框
  const cancelled = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={data.elementNo}
        data={workspaceStore.workspaceList.filter((item) => item.workspaceNo !== workspaceStore.workspaceNo)}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确 定',
    cancelButtonText: '取 消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 移动元素到指定空间
  await ElementService.moveElementToWorkspace({ elementNo: data.elementNo, workspaceNo: workspaceNo })
  // 关闭tab
  pymeterStore.removeTab({ editorNo: data.elementNo })
  // 从已选中的集合列表中移除该集合
  pymeterStore.closeScript(data.elementNo)
  // 重新查询列表
  pymeterStore.refreshElementTree()
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 启用元素
 */
const enableElement = () => {
  closeMenu()
  // 启用元素
  ElementService.enableElement({ elementNo: item.value.elementNo }).then(() => {
    // 重新查询列表
    pymeterStore.refreshElementTree()
  })
}

/**
 * 禁用元素
 */
const disableElement = () => {
  closeMenu()
  // 禁用元素
  ElementService.disableElement({ elementNo: item.value.elementNo }).then(() => {
    // 重新查询列表
    pymeterStore.refreshElementTree()
  })
}

/**
 * 跳过元素
 */
const skipElement = () => {
  closeMenu()
  // 跳过元素
  ElementService.skipElement({ elementNo: item.value.elementNo }).then(() => {
    // 重新查询列表
    pymeterStore.refreshElementTree()
  })
}

/**
 * 删除元素
 */
const removeElement = async () => {
  const data = item.value
  closeMenu()
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'error',
    title: '警告',
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
        是否确定删除 <b style="font-size: 16px">{data.elementName}</b> ？
      </span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除元素
  await ElementService.removeElement({ elementNo: data.elementNo })
  // 删除离线数据
  offlineDB.removeItem(data.elementNo)
  // 集合元素特殊处理
  if (data.elementType === 'COLLECTION') {
    // 从已选中的集合列表中移除该集合
    pymeterStore.closeScript(data.elementNo)
    // 重新查询集合列表
    pymeterStore.refreshElementRootList()
  }
  // 关闭tab
  pymeterStore.removeTab({ editorNo: data.elementNo, force: true })
  // 重新查询列表
  pymeterStore.refreshElementTree()
}
</script>

<style lang="scss">
.element-menu-popover {
  padding: 5px 0 !important;
}

.element-menu--top-option > span {
  justify-content: space-between;
  width: 100%;
}

.element-menu--shortcut-option > span {
  justify-content: space-between;
  width: 100%;
}
</style>

<style lang="scss" scoped>
.el-button {
  justify-content: flex-start;
  width: 100%;
  padding: 5px 16px !important;
  font-family: inherit;
  font-size: var(--el-font-size-base);
  font-weight: inherit;
  line-height: 22px;
  color: var(--el-text-color-regular) !important;

  &:hover {
    color: var(--el-color-primary) !important;
    background-color: var(--el-color-primary-light-9) !important;
  }
}

.el-button + .el-button {
  margin-left: 0;
}

.el-tag--small {
  width: 45px;
}

:deep(.el-divider--horizontal) {
  margin: 5px 0;
}
</style>

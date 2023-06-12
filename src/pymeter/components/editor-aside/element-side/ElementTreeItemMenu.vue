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
        <el-button link @click="openNewSQLSamplerTab">SQL请求</el-button>
        <el-button link @click="openNewSnippetSamplerTab">Snippet请求</el-button>
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
        <el-button link @click="openNewIfControllerTab">IF控制器</el-button>
        <el-button link @click="openNewWhileControllerTab">While控制器</el-button>
        <el-button link @click="openNewForInControllerTab">遍历控制器</el-button>
        <el-button link @click="openNewLoopControllerTab">循环控制器</el-button>
        <el-button link @click="openNewRetryControllerTab">重试控制器</el-button>
        <el-button link @click="openNewTransactionControllerTab">事务控制器</el-button>
      </el-popover>

      <!-- debuger 二级菜单 -->
      <el-popover
        v-if="item?.elementClass == 'SnippetCollection'"
        v-model:visible="debugerVisible"
        trigger="hover"
        placement="right-start"
        popper-class="element-menu-popover"
        transition="el-zoom-in-top"
        :hide-after="50"
        :offset="10"
      >
        <template #reference>
          <el-button link class="element-menu--top-option" @click="debugerVisible = true">
            <span>新增调试组</span>
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </template>
        <el-button link @click="openNewSetupDebugerTab">前置调试组</el-button>
        <el-button link @click="openNewTeardownDebugerTab">后置调试组</el-button>
      </el-popover>

      <template v-if="item?.elementType == 'COLLECTION'">
        <el-divider />
        <el-button link @click="copyElementToWorkspace">复制到空间</el-button>
        <el-button link @click="moveElementToWorkspace">移动到空间</el-button>
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
      <!-- 启用按钮 -->
      <el-button v-if="!item?.enabled" link class="element-menu--shortcut-option" @click="enableElement">
        <span>启用</span>
        <el-tag type="info" size="small" disable-transitions>{{ shortcutKeyPrefix }}+/</el-tag>
      </el-button>
      <!-- 禁用按钮 -->
      <el-button v-else link class="element-menu--shortcut-option" @click="disableElement">
        <span>禁用</span>
        <el-tag type="info" size="small" disable-transitions>{{ shortcutKeyPrefix }}+/</el-tag>
      </el-button>

      <el-divider />
      <!-- 删除按钮 -->
      <el-button link class="element-menu--shortcut-option" @click="removeElement">
        <span>删除</span>
        <el-tag type="info" size="small" disable-transitions>⌫</el-tag>
      </el-button>
    </div>
  </el-popover>
</template>

<script lang="jsx" setup>
import * as ElementService from '@/api/script/element'
import { ArrowRight } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'

const attrs = useAttrs()
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

const emit = defineEmits(['update:visible'])
const props = defineProps({
  node: Object
})

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
const debugerVisible = ref(false)
const showSamplers = computed(() => {
  if (!item.value) return
  return (
    item.value.elementType == 'WORKER' ||
    item.value.elementType == 'CONTROLLER' ||
    item.value.elementClass == 'SnippetCollection'
  )
})
const showControllers = computed(() => {
  if (!item.value) return
  return (
    item.value.elementType == 'WORKER' ||
    item.value.elementType == 'CONTROLLER' ||
    item.value.elementClass == 'SnippetCollection'
  )
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
  debugerVisible.value = false
  visible.value = false
}

/**
 * 打开新增 TestWorker 的标签页
 */
const openNewWorkerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '新建用例',
    editorComponent: 'TestWorker',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建用例',
    editorComponent: 'SetupWorker',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
    }
  })
}

const openNewSetupDebugerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '新建调试器',
    editorComponent: 'SetupDebuger',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建用例',
    editorComponent: 'TeardownWorker',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
    }
  })
}

const openNewTeardownDebugerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '新建调试器',
    editorComponent: 'TeardownDebuger',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建请求',
    editorComponent: 'HTTPSampler',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建请求',
    editorComponent: 'PythonSampler',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建请求',
    editorComponent: 'SQLSampler',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建请求',
    editorComponent: 'SnippetSampler',
    editorMode: 'CREATE',
    metadata: {
      workspaceNo: workspaceStore.workspaceNo,
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建控制器',
    editorComponent: 'IfController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
    }
  })
}

/**
 * 打开新增 ForinController 的标签页
 */
const openNewForInControllerTab = () => {
  closeMenu()
  pymeterStore.addTab({
    editorNo: Date.now().toString(),
    editorName: '新建控制器',
    editorComponent: 'ForInController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建控制器',
    editorComponent: 'LoopController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建控制器',
    editorComponent: 'RetryController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建事务',
    editorComponent: 'TransactionController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
    editorName: '新建控制器',
    editorComponent: 'WhileController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: item.value.rootNo,
      parentNo: item.value.elementNo
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
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      title: '警告',
      message: (
        <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">
          确认复制 {data.elementName} 吗？
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
 * 复制元素至指定空间
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
        data={workspaceStore.workspaceList}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 复制元素到指定的空间
  await ElementService.copyElementToWorkspace({ elementNo: data.elementNo, workspaceNo: workspaceNo })
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
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
        data={workspaceStore.workspaceList}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 移动元素到指定空间
  await ElementService.moveElementToWorkspace({ elementNo: data.elementNo, workspaceNo: workspaceNo })
  // 从已选中的集合列表中移除该集合
  pymeterStore.removeSelectedCollection(data.elementNo)
  // 关闭tab
  pymeterStore.removeTab({ editorNo: data.elementNo })
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
 * 删除元素
 */
const removeElement = async () => {
  const data = item.value
  closeMenu()
  // 二次确认
  const cancelled = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认删除 {data.elementName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除元素
  await ElementService.removeElement({ elementNo: data.elementNo })
  // 集合元素特殊处理
  if (data.elementType === 'COLLECTION') {
    // 从已选中的集合列表中移除该集合
    pymeterStore.removeSelectedCollection(data.elementNo)
    // 重新查询集合列表
    pymeterStore.refreshCollections()
  }
  // 关闭tab
  pymeterStore.removeTab({ editorNo: data.elementNo })
  // 重新查询列表
  pymeterStore.refreshElementTree()
}
</script>

<style lang="scss">
.element-menu-popover {
  padding: 5px 0 !important;
}

.element-menu--top-option > span {
  width: 100%;
  justify-content: space-between;
}

.element-menu--shortcut-option > span {
  width: 100%;
  justify-content: space-between;
}
</style>

<style lang="scss" scoped>
.el-button {
  justify-content: flex-start;
  width: 100%;
  padding: 5px 16px !important;
  line-height: 22px;
  color: var(--el-text-color-regular) !important;
  font-size: var(--el-font-size-base);
  font-family: inherit;
  font-weight: inherit;
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

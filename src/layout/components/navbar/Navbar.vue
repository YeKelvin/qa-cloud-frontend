<template>
  <div class="navbar">
    <div class="three-column-flexbox">
      <Hamburger :is-active="appStore.sidebar.opened" class="hamburger-container" @toggle-click="toggleSideBar" />
      <Breadcrumb />
    </div>

    <div class="three-column-flexbox" style="justify-content: center; color: #606266; font: 14px; font-family: inherit">
      <!-- 空间选择器 -->
      <span v-show="displayWorkspaceSelectorWhitelist.includes($route.path)">
        <el-tag type="danger" hit disable-transitions>空间</el-tag>
        <WorkspaceSelect />
      </span>
      <!-- 空间组件打开按钮 -->
      <el-button v-show="'/script/editor'.includes($route.path)" link @click="openWorkspaceComponents()">
        <SvgIcon icon-name="navbar-workspace-settings" style="height: 1.5em; width: 1.5em" />
      </el-button>
    </div>

    <div class="three-column-flexbox right-menu" style="justify-content: flex-end">
      <template v-if="userStore.device !== 'mobile'">
        <Search id="header-search" class="right-menu-item" />
        <Screenfull id="screenfull" class="right-menu-item hover-effect" />
      </template>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar" />
          <CaretBottom style="width: 1em; height: 1em; margin-left: 4px" />
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <el-dropdown-item @click="gotoDetails">
              <span>{{ userStore.name }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <span style="display: block">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { CaretBottom } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'
import Breadcrumb from './NavbarBreadcrumb.vue'
import Hamburger from './NavbarHamburger.vue'
import Screenfull from './NavbarScreenfull.vue'
import Search from './NavbarSearch.vue'
import WorkspaceSelect from './NavbarWorkspace.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

const displayWorkspaceSelectorWhitelist = [
  '/script/editor',
  '/script/testplan',
  '/system/workspace',
  '/system/notice/robot',
  '/schedule/task'
]

const openWorkspaceComponents = () => {
  // 未选择空间时，不允许打开组件
  if (!workspaceStore.workspaceNo) {
    ElMessage({ message: '未选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  pymeterStore.addTab({
    editorNo: workspaceStore.workspaceNo,
    editorName: workspaceStore.workspaceName,
    editorComponent: 'WorkspaceComponents',
    editorMode: 'QUERY',
    metadata: {
      workspaceName: workspaceStore.workspaceName,
      workspaceScope: workspaceStore.workspaceScope
    }
  })
}

const toggleSideBar = () => {
  appStore.toggleSideBar()
}

const gotoDetails = () => {
  router.push({ path: '/mine/details' })
}

const logout = async () => {
  await userStore.logout().then(() => {
    // 刷新页面
    location.reload()
  })
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;

  height: 50px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.hamburger-container {
  cursor: pointer;
  line-height: 46px;
  height: 100%;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}

.right-menu {
  height: 100%;
  line-height: 50px;

  &:focus {
    outline: none;
  }
}

.right-menu-item {
  display: inline-block;
  padding: 0 8px;
  height: 100%;
  font-size: 18px;
  color: #5a5e66;
  vertical-align: text-bottom;

  &.hover-effect {
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }
}

.avatar-container {
  margin-right: 20px;
  .avatar-wrapper {
    cursor: pointer;
    display: flex;
    align-items: flex-end;
  }
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.three-column-flexbox {
  display: flex;
  flex: 1 1 33.33%;
  align-items: center;
}
</style>

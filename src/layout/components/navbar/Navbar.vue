<template>
  <div class="navbar">
    <div class="three-column-flexbox">
      <Hamburger :is-active="appStore.sidebar.opened" class="hamburger-container" @toggle-click="toggleSideBar" />
      <Breadcrumb />
    </div>

    <div class="three-column-flexbox" style="justify-content: center; font: 14px; font-family: inherit; color: #606266">
      <!-- 空间选择器 -->
      <el-tag
        v-show="displayWorkspaceWhitelist.includes($route.path)"
        style="padding: 15px 10px"
        hit
        disable-transitions
        :type="workspaceStore.workspaceNo ? 'info' : 'danger'"
      >
        <WorkspaceSelect />
        <!-- 空间组件打开按钮 -->
        <el-button
          v-show="workspaceStore.workspaceNo && '/script/editor'.includes($route.path)"
          link
          @click="openWorkspaceComponents()"
        >
          <SvgIcon icon-name="navbar-workspace-settings" style="width: 1.5em; height: 1.5em" />
        </el-button>
      </el-tag>
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

const displayWorkspaceWhitelist = [
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
      sn: workspaceStore.workspaceNo,
      workspaceNo: workspaceStore.workspaceNo,
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
  box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
}

.hamburger-container {
  height: 100%;
  line-height: 46px;
  cursor: pointer;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgb(0 0 0 / 2.5%);
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
  height: 100%;
  padding: 0 8px;
  font-size: 18px;
  color: #5a5e66;
  vertical-align: text-bottom;

  &.hover-effect {
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgb(0 0 0 / 2.5%);
    }
  }
}

.avatar-container {
  margin-right: 20px;

  .avatar-wrapper {
    display: flex;
    align-items: flex-end;
    cursor: pointer;
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

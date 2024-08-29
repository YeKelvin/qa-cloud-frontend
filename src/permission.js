import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

import router from './router'

import { usePermissionStore } from '@/store/permission'
import { useUserStore } from '@/store/user'
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const noRedirectWhitelist = new Set(['/login', '/404', '/401']) // no redirect whitelist

// 用到工作空间的页面
const requiredWorkspaceURI = new Set([
  '/script/editor',
  '/script/testplan',
  '/script/workspace/setting',
  '/system/workspace',
  '/messaging/notice/bot',
  '/messaging/notice/log',
  '/schedule/job',
  '/schedule/job/log'
])

// 全局前置导航守卫
router.beforeEach(async (to, from) => {
  // 进度条开始
  // TODO: 增加window.history.state.replaced判断
  NProgress.start()

  // 自动设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 如果是跳转无需登录的页面则不校验登录状态
  if (noRedirectWhitelist.has(to.path)) return true

  const hasToken = getToken()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 判断用户是否已登录
  if (hasToken) {
    // 如果已经登录，则重定向到主页
    if (to.path === '/login') return '/'
    // 根据是否存在角色走不同逻辑
    const hasRoles = userStore.roles && userStore.roles.length > 0
    if (hasRoles) {
      // 在需要工作空间的页面，透传query参数中的空间编号
      if (requiredWorkspaceURI.has(to.path) && 'workspaceNo' in from.query) {
        return 'workspaceNo' in to.query
          ? true
          : { path: to.path, query: { ...to.query, workspaceNo: from.query.workspaceNo } }
      }
      return true
    } else {
      try {
        // 获取用户角色
        // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
        const { roles } = await userStore.queryInfo()
        // 校验角色
        checkRoles(roles)
        // 根据角色生成路由
        const accessRoutes = await permissionStore.generateRoutes(roles)
        // 动态添加路由
        for (const route of accessRoutes) router.addRoute(route)
        // 跳转目标页
        return { ...to, replace: true }
      } catch (error) {
        // 提示错误
        ElMessage.error(error.toString() || 'Error')
        // 重置 token
        await userStore.resetToken()
        // 关闭进度条
        NProgress.done()
        // 跳转登录页
        return { path: '/login', query: { redirect: to.path, ...to.query } }
      }
    }
  } else {
    // 用户未登录
    // in the free login whitelist, go directly
    if (noRedirectWhitelist.has(to.path)) return true
    // other pages that do not have permission to access are redirected to the login page.
    NProgress.done()
    // 跳转登录页
    return { path: '/login', query: { redirect: to.path, ...to.query } }
  }
})

// 全局后置导航守卫
router.afterEach(() => {
  // 进度条完成
  NProgress.done()
})

function checkRoles(roles) {
  if (!roles || roles.length <= 0) {
    throw new Error('用户角色列表不允许为空')
  }
}

import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

import router from './router'

import { usePermissionStore } from '@/store/permission'
import { useUserStore } from '@/store/user'
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const WHITE_LIST = ['/login', '/404', '/401'] // no redirect whitelist

// 需要工作空间的页面
const REQUIRED_WORKSPACE_PAGES = new Set([
  '/script/editor',
  '/script/testplan',
  '/script/workspace/setting',
  '/system/workspace',
  '/system/notice/bot',
  '/schedule/job',
  '/schedule/job/log'
])

// 全局前置导航守卫
router.beforeEach(async (to, from) => {
  // 进度条开始
  // TODO: 增加window.history.state.replaced判断
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // 如果是前往不需要登录的页面则不校验登录状态
  if (WHITE_LIST.includes(to.path)) return true

  // 确定用户是否已登录
  const hasToken = getToken()

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 判断是否存在 token
  if (hasToken) {
    if (to.path === '/login') {
      // 如果已经登录，则重定向到主页
      return '/'
    } else {
      // 确定用户是否已获取其角色
      const hasRoles = userStore.roles && userStore.roles.length > 0
      if (hasRoles) {
        // 在需要工作空间的页面，透传query参数中的空间编号
        if (REQUIRED_WORKSPACE_PAGES.has(to.path) && 'workspaceNo' in from.query) {
          return 'workspaceNo' in to.query
            ? true
            : { path: to.path, query: { ...to.query, workspaceNo: from.query.workspaceNo } }
        }
        return true
      } else {
        try {
          // 获取用户信息
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await userStore.queryInfo()
          checkRoles(roles)
          // 基于角色生成可访问路由图
          const accessRoutes = await permissionStore.generateRoutes(roles)
          // 动态添加可访问路由
          accessRoutes.forEach((route) => router.addRoute(route))
          // hack method to ensure that addRoutes is complete
          return { ...to, replace: true }
        } catch (error) {
          // 移除 token 并重定向到登录页
          ElMessage.error(error.toString() || 'Error')
          await userStore.resetToken()
          NProgress.done()
          return { path: '/login', query: { redirect: to.path, ...to.query } }
        }
      }
    }
  } else {
    /* token不存在 */
    if (WHITE_LIST.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      return true
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      NProgress.done()
      return { path: '/login', query: { redirect: to.path, ...to.query } }
    }
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

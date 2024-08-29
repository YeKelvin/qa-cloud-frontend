import { createRouter, createWebHistory } from 'vue-router'

import Layout from '@/layout'

/**
 * 所有权限通用路由表
 * 如首页和登录页和一些不用权限的公用页面
 */
export const constantRoutes = [
  {
    component: () => import('@/pages/login/Login.vue'),
    path: '/login',
    name: 'Login',
    hidden: true
  },

  {
    path: '/redirect',
    hidden: true,
    component: Layout,
    children: [
      {
        component: () => import('@/pages/redirect/Redirect.vue'),
        path: '/redirect/:path(.*)',
        name: 'Redirect'
      }
    ]
  },

  {
    component: () => import('@/pages/error/401.vue'),
    path: '/401',
    hidden: true
  },

  {
    component: () => import('@/pages/error/404.vue'),
    path: '/404',
    name: 'NoFound',
    hidden: true
  },

  {
    path: '/',
    name: 'Index',
    redirect: '/dashboard',
    component: Layout,
    children: [
      {
        component: () => import('@/pages/dashboard'),
        path: 'dashboard',
        name: 'Dashboard',
        meta: { title: '首页', icon: 'sidebar-home' }
      }
    ]
  },

  {
    path: '/mine',
    name: 'Mine',
    component: Layout,
    children: [
      {
        component: () => import('@/pages/mine/MyDetails.vue'),
        path: 'details',
        name: 'MyDetails',
        meta: { title: '个人中心' },
        hidden: true
      }
    ]
  },

  {
    path: '/script',
    name: 'Script',
    redirect: 'noRedirect',
    component: Layout,
    alwaysshow: true,
    meta: { title: '接口测试', icon: 'sidebar-api' },
    children: [
      {
        component: () => import('@/pymeter/index.vue'),
        path: 'editor',
        name: 'PyMeterEditor',
        meta: { title: '脚本编辑', icon: 'sidebar-editor' }
      },
      {
        component: () => import('@/pages/script/testplan/Testplan.vue'),
        path: 'testplan',
        name: 'Testplan',
        meta: { title: '测试计划', icon: 'sidebar-testplan' }
      },
      {
        component: () => import('@/pages/script/testplan/TestplanEditor.vue'),
        path: 'testplan/editor',
        name: 'TestplanEditor',
        meta: { title: '测试计划', activeMenu: '/script/testplan' },
        hidden: true
      },
      {
        component: () => import('@/pages/script/testplan/TestplanExecutionDetails.vue'),
        path: 'testplan/execution/details',
        name: 'ExecutionDetails',
        meta: { title: '执行详情', activeMenu: '/script/testplan' },
        hidden: true
      },
      {
        component: () => import('@/pages/script/report/Report.vue'),
        path: 'report',
        name: 'TestReport',
        meta: { title: '测试报告', activeMenu: '/script/testplan' },
        hidden: true
      },
      {
        component: () => import('@/pages/script/workspace/WorkspaceSettings.vue'),
        path: 'workspace/setting',
        name: 'WorkspaceSettings',
        meta: { title: '空间设置', icon: 'sidebar-config' }
      }
    ]
  },

  {
    path: '/schedule',
    name: 'Schedule',
    redirect: 'noRedirect',
    component: Layout,
    alwaysshow: true,
    meta: { title: '定时任务', icon: 'sidebar-schedule' },
    children: [
      {
        component: () => import('@/pages/schedule/job/Job.vue'),
        path: 'job',
        name: 'Job',
        meta: { title: '作业管理', icon: 'sidebar-schedule-job' }
      },
      {
        component: () => import('@/pages/schedule/log/JobLog.vue'),
        path: 'job/log',
        name: 'JobLog',
        meta: { title: '作业日志', icon: 'sidebar-schedule-job-log' }
      }
    ]
  },

  {
    path: '/messaging',
    name: 'Messaging',
    redirect: 'noRedirect',
    component: Layout,
    alwaysshow: true,
    meta: { title: '消息中心', icon: 'sidebar-messaging' },
    children: [
      {
        component: () => import('@/pages/messaging/notice/NoticeBot.vue'),
        path: 'notice/bot',
        name: 'NoticeBot',
        meta: { title: '通知BOT', icon: 'sidebar-notice' }
      },
      {
        component: () => import('@/pages/messaging/notice/NoticeLog.vue'),
        path: 'notice/log',
        name: 'NoticeLog',
        meta: { title: '通知日志', icon: 'sidebar-log' }
      }
    ]
  }
  // 注意!!!不要把 404 放在这里，因为 asyncRoutes 中的路由是接在这后面的
]

/**
 * 异步路由
 * 需要根据用户角色动态加载的路由
 */
export const asyncRoutes = [
  {
    path: '/system',
    name: 'System',
    redirect: 'noRedirect',
    component: Layout,
    alwaysshow: true,
    meta: { title: '系统管理', icon: 'sidebar-setting', roles: ['SYSTEM'] },
    children: [
      {
        component: () => import('@/pages/system/user/User.vue'),
        path: 'user',
        name: 'User',
        meta: { title: '用户管理', icon: 'sidebar-user' }
      },
      {
        component: () => import('@/pages/system/group/Group.vue'),
        path: 'group',
        name: 'Group',
        meta: { title: '分组管理', icon: 'sidebar-group' }
      },
      {
        component: () => import('@/pages/system/role/Role.vue'),
        path: 'role',
        name: 'Role',
        meta: { title: '角色管理', icon: 'sidebar-role' }
      },
      {
        component: () => import('@/pages/system/role/RolePermissions.vue'),
        path: 'role/permissions',
        name: 'RolePermissions',
        meta: { title: '角色权限', activeMenu: '/system/role' },
        hidden: true
      },
      {
        path: 'workspace',
        name: 'Workspace',
        meta: { title: '空间管理', icon: 'sidebar-workspace' },
        component: () => import('@/pages/system/workspace/Workspace.vue')
      },
      {
        path: 'workspace/restrictions',
        name: 'WorkspaceRestrictions',
        meta: { title: '空间管理', activeMenu: '/system/workspace' },
        component: () => import('@/pages/system/workspace/WorkspaceRestrictions.vue'),
        hidden: true
      }
    ]
  },

  {
    path: '/log',
    name: 'Log',
    redirect: 'noRedirect',
    component: Layout,
    alwaysshow: true,
    meta: { title: '日志管理', icon: 'sidebar-log', roles: ['SYSTEM'] },
    children: [
      {
        component: () => import('@/pages/log/restapi/RestAPILog.vue'),
        path: 'restapi',
        name: 'RestAPILog',
        meta: { title: '请求日志', icon: 'sidebar-api' }
      },
      {
        component: () => import('@/pages/log/login/LoginLog.vue'),
        path: 'login',
        name: 'LoginLog',
        meta: { title: '登录日志', icon: 'sidebar-user' }
      }
    ]
  },

  {
    path: '/opencenter',
    name: 'OpenCenter',
    redirect: 'noRedirect',
    component: Layout,
    alwaysshow: true,
    meta: { title: '开放中心', icon: 'sidebar-opencenter', roles: ['SYSTEM'] },
    children: [
      {
        component: () => import('@/pages/opencenter/application/Application.vue'),
        path: 'application',
        name: 'Application',
        meta: { title: '应用管理', icon: 'sidebar-application' }
      },
      {
        component: () => import('@/pages/opencenter/apilog/OpenAPILog.vue'),
        path: 'apilog',
        name: 'APILog',
        meta: { title: '接口日志', icon: 'sidebar-log' }
      },
      {
        component: () => import('@/pages/opencenter/token/TokenManager.vue'),
        path: 'token',
        name: 'Token',
        meta: { title: '访问令牌', activeMenu: '/opencenter/application' },
        hidden: true
      },
      {
        component: () => import('@/pages/opencenter/token/TokenEditor.vue'),
        path: 'token-editor',
        name: 'TokenEditor',
        meta: { title: '访问令牌', activeMenu: '/opencenter/application' },
        hidden: true
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true }
]

const router = createRouter({
  strict: true,
  routes: constantRoutes,
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0, left: 0 })
})

const resetWhitelist = new Set(['Redirect', 'Login', 'NoFind'])

export const resetRouter = () => {
  for (const route of router.getRoutes()) {
    const { name } = route
    if (name && !resetWhitelist.has(name)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  }
}

export default router

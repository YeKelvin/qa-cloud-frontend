import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout'

/**
 * 所有权限通用路由表
 * 如首页和登录页和一些不用权限的公用页面
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        component: () => import('@/pages/redirect'),
        path: '/redirect/:path(.*)'
      }
    ]
  },

  {
    path: '/login',
    component: () => import('@/pages/login/Login.vue'),
    hidden: true
  },

  {
    path: '/401',
    component: () => import('@/pages/error/401.vue'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/pages/error/404.vue'),
    hidden: true
  },

  {
    path: '/',
    name: 'Index',
    component: Layout,
    redirect: '/dashboard',
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
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
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
        path: 'workspace/setting/:item?',
        name: 'WorkspaceSettings',
        meta: { title: '空间设置', icon: 'sidebar-config' },
        hidden: true
      },
      {
        path: 'workspace/setting/workspace-info',
        meta: { title: '空间设置', icon: 'sidebar-config' }
      }
    ]
  },

  {
    path: '/schedule',
    name: 'Schedule',
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
    meta: { title: '定时任务', icon: 'sidebar-schedule' },
    children: [
      {
        component: () => import('@/pages/schedule/task/Task.vue'),
        path: 'task',
        name: 'Task',
        meta: { title: '任务管理', icon: 'sidebar-schedule-task' }
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
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
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
      },
      {
        component: () => import('@/pages/system/message/NoticeRobot.vue'),
        path: 'notice/robot',
        name: 'NoticeRobot',
        meta: { title: '消息管理', icon: 'sidebar-notification' }
      }
    ]
  },

  {
    path: '/log',
    name: 'Log',
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
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
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
    meta: { title: '开放平台', icon: 'sidebar-opencenter', roles: ['SYSTEM'] },
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
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '/:pathMatch(.*)', redirect: '/404', hidden: true }
]

const createVueRouter = () =>
  createRouter({
    history: createWebHistory(),
    scrollBehavior: () => ({ top: 0 }),
    routes: constantRoutes
  })

const router = createVueRouter()

export default router

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
        component: () => import('@/views/redirect'),
        path: '/redirect/:path(.*)'
      }
    ]
  },

  {
    path: '/login',
    component: () => import('@/views/login/Login.vue'),
    hidden: true
  },

  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },

  {
    path: '/',
    name: 'Index',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        component: () => import('@/views/dashboard'),
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
        component: () => import('@/views/mine/MyDetails.vue'),
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
        component: () => import('@/views/script/testplan/Testplan.vue'),
        path: 'testplan',
        name: 'TestplanManager',
        meta: { title: '计划管理', icon: 'sidebar-testplan' }
      },
      {
        component: () => import('@/views/script/testplan/TestplanEditor.vue'),
        path: 'testplan/editor',
        name: 'TestplanEditor',
        meta: { title: '测试计划', activeMenu: '/script/testplan' },
        hidden: true
      },
      {
        component: () => import('@/views/script/testplan/TestplanExecutionDetails.vue'),
        path: 'testplan/execution/details',
        name: 'ExecutionDetails',
        meta: { title: '计划详情', activeMenu: '/script/testplan' },
        hidden: true
      },
      {
        component: () => import('@/views/script/report/Report.vue'),
        path: 'report',
        name: 'TestReport',
        meta: { title: '测试报告', activeMenu: '/script/testplan' },
        hidden: true
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
        component: () => import('@/views/schedule/task/Task.vue'),
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
    meta: { title: '系统管理', icon: 'sidebar-setting' },
    children: [
      {
        component: () => import('@/views/system/user/User.vue'),
        path: 'user',
        name: 'User',
        meta: { title: '用户管理', icon: 'sidebar-user', roles: ['ADMIN'] }
      },
      {
        component: () => import('@/views/system/group/Group.vue'),
        path: 'group',
        name: 'Group',
        meta: { title: '分组管理', icon: 'sidebar-group', roles: ['ADMIN'] }
      },
      {
        component: () => import('@/views/system/role/Role.vue'),
        path: 'role',
        name: 'Role',
        meta: { title: '角色管理', icon: 'sidebar-role', roles: ['ADMIN'] }
      },
      {
        component: () => import('@/views/system/role/RolePermissions.vue'),
        path: 'role/permissions',
        name: 'RolePermissions',
        meta: { title: '角色权限', activeMenu: '/system/role', roles: ['ADMIN'] },
        hidden: true
      },
      {
        path: 'workspace',
        name: 'Workspace',
        meta: { title: '空间管理', icon: 'sidebar-workspace', roles: ['ADMIN'] },
        component: () => import('@/views/system/workspace/Workspace.vue')
      },
      {
        path: 'workspace/restrictions',
        name: 'WorkspaceRestrictions',
        meta: { title: '空间管理', activeMenu: '/system/workspace', roles: ['ADMIN'] },
        component: () => import('@/views/system/workspace/WorkspaceRestrictions.vue'),
        hidden: true
      },
      {
        component: () => import('@/views/system/message/NoticeRobot.vue'),
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
    meta: { title: '日志管理', icon: 'sidebar-log', roles: ['ADMIN'] },
    children: [
      {
        component: () => import('@/views/log/restapi/RestAPILog.vue'),
        path: 'restapi',
        name: 'RestAPILog',
        meta: { title: '请求日志', icon: 'sidebar-api' }
      }
    ]
  },

  {
    path: '/opencenter',
    name: 'OpenCenter',
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
    roles: ['ADMIN'],
    meta: { title: '开放平台', icon: 'sidebar-opencenter' },
    children: [
      {
        component: () => import('@/views/opencenter/application/Application.vue'),
        path: 'application',
        name: 'Application',
        meta: { title: '应用管理', icon: 'sidebar-application' }
      },
      {
        component: () => import('@/views/opencenter/apilog/OpenAPILog.vue'),
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

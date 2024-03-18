import { defineStore } from 'pinia'

import { asyncRoutes, constantRoutes } from '@/router'

function hasPermission(roles, route) {
  return route.meta && route.meta.roles ? roles.some((role) => route.meta.roles.includes(role)) : true
}

export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach((route) => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

export const usePermissionStore = defineStore('permission', {
  state: () => {
    return {
      routes: [],
      addRoutes: []
    }
  },
  getters: {},
  actions: {
    generateRoutes(roles) {
      return new Promise((resolve) => {
        const accessedRoutes = roles.includes('ADMIN') ? asyncRoutes || [] : filterAsyncRoutes(asyncRoutes, roles)
        this.addRoutes = accessedRoutes
        this.routes = constantRoutes.concat(accessedRoutes)
        resolve(accessedRoutes)
      })
    }
  }
})

import { isEmpty } from 'lodash-es'
import { defineStore } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import * as WorkspaceService from '@/api/system/workspace'
import { usePyMeterStore } from '@/store/pymeter'
import { useUserStore } from '@/store/user'

export const useWorkspaceStore = defineStore('workspace', {
  state: () => {
    const route = useRoute()
    const router = useRouter()
    return {
      // 路由相关
      route,
      router,

      /**
       * 当前选择的空间编号
       */
      wsno: '',

      /**
       * 默认空间编号
       */
      defaultNo: '',

      /**
       * 工作空间列表
       */
      workspaceList: []
    }
  },
  persist: {
    pick: ['wsno']
  },
  getters: {
    workspaceNo() {
      const workspaceNo = this.route.query.workspaceNo
      return isEmpty(workspaceNo) ? this.wsno : workspaceNo
    },
    workspaceName() {
      if (isEmpty(this.workspaceNo)) return '请选择工作空间'
      const ws = this.workspaceList.find(item => item.workspaceNo === this.workspaceNo)
      if (!ws) return ''
      return ws.workspaceName
    },
    workspaceScope() {
      if (isEmpty(this.workspaceNo)) return
      const ws = this.workspaceList.find(item => item.workspaceNo === this.workspaceNo)
      if (!ws) return
      return ws.workspaceScope
    }
  },
  actions: {
    /**
     * 查询所有工作空间
     */
    async loadsWorkspaceList() {
      // 查询空间列表
      const response = await WorkspaceService.queryWorkspaceAll({ userNo: useUserStore().number })
      const defaultList = []
      const personalList = []
      const teamList = []
      const publicList = []
      // 分类存储
      for (const item of response.data) {
        switch (item.workspaceScope) {
          case 'DEFAULT': {
            defaultList.push(item)
            break
          }
          case 'PERSONAL': {
            personalList.push(item)
            break
          }
          case 'TEAM': {
            teamList.push(item)
            break
          }
          case 'PUBLIC': {
            publicList.push(item)
            break
          }
        }
      }
      // 存储默认空间编号
      this.defaultNo = defaultList[0].workspaceNo
      // 存储所有空间，置顶个人空间
      this.workspaceList = [...defaultList, ...personalList, ...teamList, ...publicList]
      // 检验当前空间是否有效
      this.validateCurrent()
    },
    /**
     * 切换工作空间
     */
    changeWorkspace({ workspaceNo }) {
      // 切换到指定空间
      this.wsno = workspaceNo
      // 清空query参数
      this.router.replace({ path: this.route.path })
      // 清理工作
      const pymeterStore = usePyMeterStore()
      // 关闭所有 tab 页
      pymeterStore.removeAllTab()
      // 打开空间的离线数据
      pymeterStore.openOfflineTab()
    },
    /**
     * 校验当前的工作空间是否有效
     */
    validateCurrent() {
      // 空间列表为空代表还没有加载，不校验，因为至少也会有一个默认空间
      if (isEmpty(this.workspaceList)) return
      // 校验query参数中的工作空间是否有效
      if ('workspaceNo' in this.route.query && !this.isValidWorkspace(this.route.query.workspaceNo)) {
        // 清空无效空间相关缓存
        usePyMeterStore().clearWorkspaceCache(this.route.query.workspaceNo)
        // 跳转至默认空间
        this.wsno = this.defaultNo
        // 清空query参数
        this.router.replace({ path: this.route.path })
      }
      // 校验是否有选择工作空间，没有则跳转至默认空间
      if (isEmpty(this.wsno)) {
        this.wsno = this.defaultNo
        return
      }
      // 校验当前工作空间是否有效（有可能因为空间修改或删除导致失效）
      if (!this.isValidWorkspace(this.wsno)) {
        // 清空无效空间相关缓存
        usePyMeterStore().clearWorkspaceCache(this.wsno)
        // 跳转至默认空间
        this.wsno = this.defaultNo
        // 刷新页面
        this.router.replace({ path: this.route.path })
      }
    },
    /**
     * 判断是否为有效的工作空间
     */
    isValidWorkspace(number) {
      return this.workspaceList.some(item => item.workspaceNo === number)
    }
  }
})

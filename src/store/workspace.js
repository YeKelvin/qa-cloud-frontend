import { defineStore } from 'pinia'

import * as WorkspaceService from '@/api/public/workspace'
import { usePyMeterStore } from '@/store/pymeter'
import { useUserStore } from '@/store/user'

export const useWorkspaceStore = defineStore('workspace', {
  state: () => {
    return {
      /**
       * 当前选择的工作空间编号
       */
      workspaceNo: '',

      /**
       * 当前选择的工作空间名称
       */
      workspaceName: '请选择工作空间',

      /**
       * 当前选择的工作空间作用域
       */
      workspaceScope: '',

      /**
       * 工作空间列表
       */
      workspaceList: []
    }
  },
  persist: {
    paths: ['workspaceNo', 'workspaceName', 'workspaceScope']
  },
  getters: {},
  actions: {
    changeWorkspace({ workspaceNo, workspaceName, workspaceScope }) {
      this.workspaceNo = workspaceNo
      this.workspaceName = workspaceName
      this.workspaceScope = workspaceScope
      const pymeterStore = usePyMeterStore()
      // 关闭所有 tab 页
      pymeterStore.removeAllTab()
      // 清空已选择的变量集列表
      pymeterStore.clearSelectedDataset()
      // 打开空间的离线数据
      pymeterStore.openOfflineTab()
    },

    /**
     * 查询所有工作空间
     */
    loadsWorkspaceList() {
      const userStore = useUserStore()
      WorkspaceService.queryWorkspaceAll({ userNo: userStore.number }).then((response) => {
        // 个人空间
        const privateList = response.data.filter((item) => item.workspaceScope === 'PRIVATE')
        // 团队空间
        const protectedList = response.data.filter((item) => item.workspaceScope === 'PROTECTED')
        // 公共空间
        const publicList = response.data.filter((item) => item.workspaceScope === 'PUBLIC')
        // 存储所有空间，置顶个人空间
        this.workspaceList = [...privateList, ...protectedList, ...publicList]
        // 当前工作空间不为空且不在工作空间列表中时（表示该工作空间已无效），清空localStorage
        if (this.workspaceNo !== '') {
          if (response.data.findIndex((item) => item.workspaceNo === this.workspaceNo) < 0) {
            this.workspaceNo = ''
            this.workspaceName = '请选择工作空间'
          }
        } else {
          // 如果当前未选择工作空间，清空已选择的脚本列表
          window.localStorage.removeItem('selectedScripts')
        }
      })
    }
  }
})

import { isEmpty } from 'lodash-es'
import { defineStore } from 'pinia'

import { confirmClose, removeCache } from './pymeter-tools'

import { usePyMeterDB } from '@/store/pymeter-db'

export const usePyMeterStore = defineStore('pymeter', {
  state: () => {
    return {
      // keepAlive实例
      keepAlive: null,

      // 编辑器 tab 列表
      tabs: [],

      // 当前 tab 的编号（elementNo）
      activeTabNo: '',

      // 刷新集合列表
      flagAsRefreshElementRootList: 0,

      // 刷新脚本元素
      flagAsRefreshElementTree: 0,

      // 滚动至脚本列表底部
      flagAsScrollToElementTreeBottom: 0,

      // 待展开节点的元素编号
      pendingExpandedElementNo: 0,

      // 是否使用当前值（缓存）
      useCurrentValue: true,
      // 当前选中的变量集列表（缓存）
      selectedDatasets: [],
      // 当前选中的集合编号列表（缓存）
      selectedScripts: [],

      // 显示底部抽屉窗口
      showingFooterDrawer: false,
      activeFooterViewer: 'RESULT'
    }
  },
  persist: {
    paths: ['selectedDatasets', 'useCurrentValue', 'selectedScripts']
  },
  getters: {},
  actions: {
    /**
     * 获取当前tab
     */
    currentTab() {
      const tab = this.tabs.filter((tab) => tab.editorNo === this.activeTabNo)
      return tab ? tab[0] : null
    },

    pushTab({ editorNo, editorName, editorComponent, editorMode, metadata = {}, unsaved = false }) {
      // 标识tab是否不存在
      let nonexistent = true
      // 查找是否存在相同编号的tab
      const size = this.tabs.length
      for (let i = 0; i < size; i++) {
        const tab = this.tabs[i]
        // 如果存在则激活tab
        if (tab.editorNo === editorNo || tab.metadata.sn === editorNo) {
          nonexistent = false
          break
        }
      }
      // 不存在则打开新的tab并激活
      if (nonexistent) {
        this.tabs.push({
          editorNo,
          editorName,
          editorComponent,
          editorMode,
          closing: false,
          unsaved,
          metadata
        })
      }
    },
    /**
     * 添加 tab
     */
    addTab({ editorNo, editorName, editorComponent, editorMode, metadata = {}, unsaved = false }) {
      // 标识tab是否不存在
      let nonexistent = true
      // 查找是否存在相同编号的tab
      const size = this.tabs.length
      for (let i = 0; i < size; i++) {
        const tab = this.tabs[i]
        // 如果存在则激活tab
        if (tab.editorNo === editorNo || tab.metadata.sn === editorNo) {
          nonexistent = false
          this.activeTabNo = tab.editorNo
          break
        }
      }
      // 不存在则打开新的tab并激活
      if (nonexistent) {
        this.tabs.push({
          editorNo,
          editorName,
          editorComponent,
          editorMode,
          closing: false,
          unsaved,
          metadata
        })
        this.activeTabNo = editorNo
      }
    },

    /**
     * 关闭 tab 并移除 keep-alive 缓存
     */
    async removeTab({ editorNo, force = false }) {
      let closingTab = null
      let closingIndex = null
      // 获取需要关闭的tab对象
      const size = this.tabs.length
      for (let i = 0; i < size; i++) {
        if (this.tabs[i].editorNo === editorNo) {
          closingTab = this.tabs[i]
          closingIndex = i
        }
      }
      // 强制关闭，主要用于删除元素
      // 如果tab数据未保存，则添加一个关闭中的标识并激活tab
      if (!force && closingTab && closingTab.unsaved) {
        // 激活tab
        this.activeTabNo = editorNo
        // 二次确认
        const canceled = await confirmClose(closingTab)
        if (canceled) return
      }
      // 如果需要关闭的tab为当前激活的tab，则需要把当前tab改为下一个或上一个
      if (this.activeTabNo === editorNo) {
        const nextTab = this.tabs[closingIndex + 1] || this.tabs[closingIndex - 1]
        if (nextTab) {
          this.activeTabNo = nextTab.editorNo
        }
      }
      // 删除tab
      this.tabs = this.tabs.filter((tab) => tab.editorNo !== editorNo)
      // 手动移除 keep-alive 缓存
      removeCache(this.keepAlive, editorNo)
    },

    /**
     * 更新 tabName
     */
    updateTab({ editorNo, editorName = null, metadata = null }) {
      const size = this.tabs.length
      for (let i = 0; i < size; i++) {
        if (this.tabs[i].editorNo === editorNo) {
          if (editorName) {
            this.tabs[i].editorName = editorName
          }
          if (metadata) {
            Object.assign(this.tabs[i].metadata, metadata)
          }
        }
      }
    },

    /**
     * 关闭所有已打开的 tab 页
     */
    removeAllTab() {
      this.tabs = []
      this.activeTabNo = ''
    },

    async openOfflineTab() {
      const pymeterDB = usePyMeterDB()
      await pymeterDB.offlineDB.iterate((offline, key) => {
        this.pushTab({
          editorNo: isEmpty(offline.meta.sn) ? key : offline.meta.sn,
          editorName: offline.meta.name,
          editorComponent: offline.meta.component,
          unsaved: true,
          metadata: offline.meta
        })
      })
      const tabs = this.tabs
      if (tabs.length > 0) {
        this.activeTabNo = tabs.at(-1).editorNo
      }
    },

    /**
     * 立即刷新集合列表
     */
    refreshElementRootList() {
      this.flagAsRefreshElementRootList += 1
    },

    /**
     * 立即刷新脚本内容
     */
    refreshElementTree() {
      this.flagAsRefreshElementTree += 1
    },

    /**
     * 滚动至脚本列表底部
     */
    scrollToElementTreeBottom() {
      this.flagAsScrollToElementTreeBottom += 1
    },

    /**
     * 展开元素节点
     */
    expandedElement(elementNo) {
      this.pendingExpandedElementNo = elementNo
    },

    /**
     * 添加已选择的集合元素
     */
    openScript(rootNo) {
      if (this.selectedScripts.includes(rootNo)) return
      this.selectedScripts.push(rootNo)
    },

    /**
     * 移除已选择的集合元素
     */
    closeScript(rootNo) {
      this.selectedScripts = this.selectedScripts.filter((item) => item !== rootNo)
    },

    /**
     * 打开结果视图窗口
     */
    openResultDrawer() {
      this.activeFooterViewer = 'RESULT'
      this.showingFooterDrawer = true
    },

    /**
     * 打开日志视图窗口
     */
    openLogDrawer() {
      this.activeFooterViewer = 'LOG'
      this.showingFooterDrawer = true
    },

    /**
     * 关闭底部抽屉窗口
     */
    closeFooterDrawer() {
      this.showingFooterDrawer = false
    },

    /**
     * 切换窗口打开状态
     */
    toggleResultView() {
      if (this.activeFooterViewer === 'RESULT') {
        this.showingFooterDrawer = !this.showingFooterDrawer
      } else {
        this.activeFooterViewer = 'RESULT'
        this.showingFooterDrawer = true
      }
    },

    /**
     * 切换窗口打开状态
     */
    toggleLogView() {
      if (this.activeFooterViewer === 'LOG') {
        this.showingFooterDrawer = !this.showingFooterDrawer
      } else {
        this.activeFooterViewer = 'LOG'
        this.showingFooterDrawer = true
      }
    },

    /**
     * 清空已选择的变量集列表
     */
    clearSelectedDataset() {
      this.selectedDatasets = []
    }
  }
})

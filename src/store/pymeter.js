import { defineStore } from 'pinia'
import { useWorkspaceStore } from '@/store/workspace'
import { isEmpty } from 'lodash-es'
import { removeCache } from './pymeter-tools'
import * as VariablesService from '@/api/script/variables'
import * as HttpHeadersService from '@/api/script/headers'
import * as DatabaseService from '@/api/script/database'

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
      refreshCollectionsFlag: 0,

      // 刷新脚本元素
      refreshElementTreeFlag: 0,

      // 滚动至脚本列表底部
      scrollToElementTreeBottomFlag: 0,

      // 待展开节点的元素编号
      pendingExpandedElementNo: 0,

      // 全局变量集列表
      globalDatasetList: [],
      // 空间变量集列表
      workspaceDatasetList: [],
      // 环境变量集列表
      environmentDatasetList: [],
      // 自定义变量集列表
      customDatasetList: [],

      // 当前选中的变量集列表（缓存）
      selectedDatasets: [],

      // 是否使用当前值（缓存）
      useCurrentValue: true,

      // 当前选中的集合编号列表（缓存）
      selectedCollections: [],

      // 显示底部抽屉窗口
      showingFooterDrawer: false,
      activeFooterViewName: 'RESULT',

      // 请求头模板列表
      httpheaderTemplateList: [],

      // 数据库配置列表
      databaseEngineList: []
    }
  },
  persist: {
    paths: ['selectedDatasets', 'useCurrentValue', 'selectedCollections']
  },
  getters: {
    datasetList() {
      return [...this.globalDatasetList, ...this.environmentDatasetList, ...this.customDatasetList]
    }
  },
  actions: {
    /**
     * 添加 tab
     */
    addTab({ editorNo, editorName, editorComponent, editorMode, metadata }) {
      const tabList = [...this.tabs]

      let notExists = true
      for (let i = 0; i < tabList.length; i++) {
        const tab = tabList[i]
        if (tab.editorNo === editorNo || tab.metadata.realNo === editorNo) {
          notExists = false
          this.activeTabNo = tab.editorNo
          break
        }
      }

      if (notExists) {
        metadata = metadata || {}
        metadata.realNo = editorNo
        this.tabs.push({
          editorNo,
          editorName,
          editorComponent,
          editorMode,
          metadata
        })
        this.activeTabNo = editorNo
      }
    },

    /**
     * 关闭 tab 并移除 keep-alive 缓存
     */
    removeTab({ editorNo }) {
      const tabList = [...this.tabs]
      const tabNo = this.activeTabNo

      if (tabNo === editorNo) {
        for (let i = 0; i < tabList.length; i++) {
          const tab = tabList[i]
          if (tab.editorNo === editorNo) {
            const nextTab = tabList[i + 1] || tabList[i - 1]
            if (nextTab) {
              this.activeTabNo = nextTab.editorNo
            }
          }
        }
      }
      this.tabs = tabList.filter((tab) => tab.editorNo !== editorNo)

      // 手动移除 keep-alive 缓存
      removeCache(this.keepAlive, editorNo)
    },

    /**
     * 更新 tabName
     */
    updateTab({ editorNo, editorName = null, realNo = null }) {
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].editorNo === editorNo) {
          if (editorName) {
            this.tabs[i].editorName = editorName
          }
          if (realNo) {
            this.tabs[i].metadata.realNo = realNo
          }
        }
      }
    },

    /**
     * 关闭所有已打开的 tab 页
     */
    removeAllTab() {
      this.tabs.forEach((tab) => this.removeTab(tab))
      this.activeTabNo = ''
    },

    /**
     * 立即刷新集合列表
     */
    refreshCollections() {
      this.refreshCollectionsFlag += 1
    },

    /**
     * 立即刷新脚本内容
     */
    refreshElementTree() {
      this.refreshElementTreeFlag += 1
    },

    /**
     * 滚动至脚本列表底部
     */
    scrollToElementTreeBottom() {
      this.scrollToElementTreeBottomFlag += 1
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
    addSelectedCollection(collectionNo) {
      if (this.selectedCollections.includes(collectionNo)) return
      this.selectedCollections.push(collectionNo)
    },

    /**
     * 移除已选择的集合元素
     */
    removeSelectedCollection(collectionNo) {
      this.selectedCollections = this.selectedCollections.filter((item) => item !== collectionNo)
    },

    /**
     * 打开结果视图窗口
     */
    openResultDrawer() {
      this.activeFooterViewName = 'RESULT'
      this.showingFooterDrawer = true
    },

    /**
     * 打开日志视图窗口
     */
    openLogDrawer() {
      this.activeFooterViewName = 'LOG'
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
      if (this.activeFooterViewName == 'RESULT') {
        this.showingFooterDrawer = !this.showingFooterDrawer
      } else {
        this.activeFooterViewName = 'RESULT'
        this.showingFooterDrawer = true
      }
    },

    /**
     * 切换窗口打开状态
     */
    toggleLogView() {
      if (this.activeFooterViewName == 'LOG') {
        this.showingFooterDrawer = !this.showingFooterDrawer
      } else {
        this.activeFooterViewName = 'LOG'
        this.showingFooterDrawer = true
      }
    },

    /**
     * 清空已选择的变量集列表
     */
    clearSelectedDataset() {
      this.selectedDatasets = []
    },

    /**
     * 查询所有数据集列表
     */
    async queryDatasetAll() {
      // 查询变量集列表
      const response = await VariablesService.queryVariableDatasetAll({ workspaceNo: useWorkspaceStore().workspaceNo })

      // 全局变量
      this.globalDatasetList = response.result.filter((item) => item.datasetType === 'GLOBAL')
      // 空间变量
      this.workspaceDatasetList = response.result.filter((item) => item.datasetType === 'WORKSPACE')
      // 环境变量
      this.environmentDatasetList = response.result.filter((item) => item.datasetType === 'ENVIRONMENT')
      // 自定义变量
      this.customDatasetList = response.result.filter((item) => item.datasetType === 'CUSTOM')

      // 判断是否存在无效数据，存在则删除
      // 当前选择的变量集不为空且不在变量集列表中时（表示该变量集已无效），删除该变量集编号
      const datasets = response.result.map((item) => item.datasetNo)
      for (let i = this.selectedDatasets.length - 1; i >= 0; i--) {
        if (!datasets.includes(this.selectedDatasets[i])) {
          // 删除无效数据
          this.selectedDatasets.splice(i, 1)
        }
      }

      this.disableOtherEnvironmentDataset()
    },

    /**
     * 设置当前选中的变量集列表
     */
    setSelectedDatasets(data) {
      this.selectedDatasets = data
      this.disableOtherEnvironmentDataset()
    },

    /**
     * 禁用未选择的环境变量集（已选择了一个环境变量集的情况下）
     */
    disableOtherEnvironmentDataset() {
      // 没有选中任何变量集时，开放所有环境变量集
      if (isEmpty(this.selectedDatasets)) {
        this.environmentDatasetList.forEach((env) => (env.disabled = false))
      }
      // 判断当前选中的变量集是否需要禁用
      let environmentCount = 0
      this.selectedDatasets.forEach((datasetNo) => {
        if (this.isGlobalDataset(datasetNo) || this.isWorkspaceDataset(datasetNo) || this.isCustomDataset(datasetNo)) {
          return
        }
        // 已经选择了环境变量集，禁用其余环境变量集
        if (this.isEnvironmentDataset(datasetNo)) {
          environmentCount += 1
          this.environmentDatasetList.forEach((env) => (env.disabled = env.datasetNo !== datasetNo))
        }
      })
      // 没有选择环境变量集时，开放所有环境变量集
      if (environmentCount === 0) {
        this.environmentDatasetList.forEach((env) => (env.disabled = false))
      }
    },

    isGlobalDataset(datasetNo) {
      const index = this.globalDatasetList.findIndex((item) => item.datasetNo === datasetNo)
      return index > -1
    },

    isWorkspaceDataset(datasetNo) {
      const index = this.workspaceDatasetList.findIndex((item) => item.datasetNo === datasetNo)
      return index > -1
    },

    isEnvironmentDataset(datasetNo) {
      const index = this.environmentDatasetList.findIndex((item) => item.datasetNo === datasetNo)
      return index > -1
    },

    isCustomDataset(datasetNo) {
      const index = this.customDatasetList.findIndex((item) => item.datasetNo === datasetNo)
      return index > -1
    },

    /**
     * 查询所有请求头模板
     */
    queryHttpheaderTemplateAll() {
      HttpHeadersService.queryHttpheaderTemplateAll({ workspaceNo: useWorkspaceStore().workspaceNo }).then(
        (response) => {
          this.httpheaderTemplateList = response.result
        }
      )
    },

    /**
     * 查询所有数据库配置
     */
    queryDatabaseEngineAll() {
      DatabaseService.queryDatabaseEngineAll({ workspaceNo: useWorkspaceStore().workspaceNo }).then((response) => {
        this.databaseEngineList = response.result
      })
    }
  }
})

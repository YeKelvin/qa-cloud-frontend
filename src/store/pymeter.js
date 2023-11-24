import * as ElementService from '@/api/script/element'
import * as HttpHeadersService from '@/api/script/headers'
import * as VariablesService from '@/api/script/variables'
import { usePyMeterDB } from '@/store/pymeter-db'
import { useWorkspaceStore } from '@/store/workspace'
import { isEmpty } from 'lodash-es'
import { defineStore } from 'pinia'
import { confirmClose, removeCache } from './pymeter-tools'

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

      // 变量集列表
      datasetList: [],
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
      // 当前选择的环境变量集编号
      selectedEnvironmentNo: '',

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
        this.activeTabNo = tabs[tabs.length - 1].editorNo
      }
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
      if (this.activeFooterViewName === 'RESULT') {
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
      if (this.activeFooterViewName === 'LOG') {
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

      // 全部变量集
      this.datasetList = response.result
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
        // 删除无效数据
        if (!datasets.includes(this.selectedDatasets[i])) {
          this.selectedDatasets.splice(i, 1)
        }
      }

      // 禁用其余未选择的环境变量集
      this.disableOtherEnvDataset()
    },

    /**
     * 设置当前选中的变量集列表
     */
    setSelectedDatasets(data) {
      this.selectedDatasets = data
      this.disableOtherEnvDataset()
    },

    /**
     * 禁用未选择的环境变量集（已选择了一个环境变量集的情况下）
     */
    disableOtherEnvDataset() {
      // 没有选中任何变量集时，开放所有环境变量集
      if (isEmpty(this.selectedDatasets)) {
        this.environmentDatasetList.forEach((item) => (item.disabled = false))
      }
      // 从已选择的变量集中过滤出环境变量集
      const envs = this.datasetList.filter(
        (item) => item.datasetType === 'ENVIRONMENT' && this.selectedDatasets.includes(item.datasetNo)
      )

      if (envs.length > 0) {
        // 存储当前环境编号
        this.selectedEnvironmentNo = envs[0].datasetNo
        // 已经选择了环境变量集，禁用其余环境变量集
        this.environmentDatasetList.forEach((item) => (item.disabled = item.datasetNo !== envs[0].datasetNo))
      } else {
        this.selectedEnvironmentNo = ''
        // 没有选择环境变量集时，开放所有环境变量集
        this.environmentDatasetList.forEach((item) => (item.disabled = false))
      }
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
      ElementService.queryDatabaseEngineAll({ workspaceNo: useWorkspaceStore().workspaceNo }).then((response) => {
        this.databaseEngineList = response.result
      })
    }
  }
})

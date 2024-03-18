import localforage from 'localforage'

import { useWorkspaceStore } from '@/store/workspace'

export const usePyMeterDB = defineStore('pymeter-db', {
  state: () => {
    return {
      database: new Map()
    }
  },
  getters: {
    offlineDB: (state) => {
      const workspaceNo = useWorkspaceStore().workspaceNo
      if (!state.database.has(workspaceNo)) {
        state.database.set(workspaceNo, localforage.createInstance({ name: workspaceNo, storeName: 'offline-data' }))
      }
      return state.database.get(workspaceNo)
    }
  },
  actions: {
    async remove(key) {
      await this.offlineDB.removeItem(key)
    }
  }
})

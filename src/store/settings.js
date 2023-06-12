import { defineStore } from 'pinia'
import defaultSettings from '@/settings'

const { showSettings, fixedHeader, sidebarLogo } = defaultSettings

export const useSettingsStore = defineStore('settings', {
  state: () => {
    return {
      showSettings: showSettings,
      fixedHeader: fixedHeader,
      sidebarLogo: sidebarLogo
    }
  },
  getters: {},
  actions: {
    changeSetting(data) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.$state.hasOwnProperty(data.key)) {
        this[data.key] = data.value
      }
    }
  }
})

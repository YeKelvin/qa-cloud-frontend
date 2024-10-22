import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => {
    return {
      sidebar: {
        opened: true,
        withoutAnimation: false
      },
      device: 'desktop'
    }
  },
  persist: {
    pick: ['sidebar.opened']
  },
  getters: {},
  actions: {
    toggleSideBar() {
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = false
    },
    closeSideBar({ withoutAnimation }) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },
    toggleDevice(device) {
      this.device = device
    }
  }
})

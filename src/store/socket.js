import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socketio', {
  state: () => {
    return {
      instance: null
    }
  },
  getters: {},
  actions: {}
})

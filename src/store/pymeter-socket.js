import { defineStore } from 'pinia'

export const usePymeterSocketStore = defineStore('pymeter-socketio', {
  state: () => {
    return {
      instance: null
    }
  },
  getters: {},
  actions: {
    cancelExecuting() {
      this.instance.emit('pymeter:cancel_execution')
    }
  }
})

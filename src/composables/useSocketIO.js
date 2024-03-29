import useSocket from './useSocket'

import { usePymeterSocketStore } from '@/store/pymeter-socket'
import { useUserStore } from '@/store/user'

export default function useSocketIO() {
  const socket = useSocket()
  const userStore = useUserStore()
  const pymeterSocketStore = usePymeterSocketStore()

  /**
   * 设置请求头
   */
  const setAccessToken = () => {
    socket.io.opts.transportOptions = {
      polling: {
        extraHeaders: {
          'access-token': userStore.token
        }
      }
    }
  }

  /**
   * 连接
   */
  const connect = () => {
    setAccessToken()
    if (socket.disconnected) {
      socket.open()
      pymeterSocketStore.instance = socket
    }
  }

  /**
   * 断开连接
   */
  const disconnect = () => {
    if (socket.connected) {
      socket.close()
      pymeterSocketStore.instance = null
    }
  }

  /**
   * 连接并返回 sid
   */
  const getId = (timeout = 2000) => {
    let timeoutId = null
    let intervalId = null

    return new Promise((resolve, reject) => {
      if (socket.id) resolve(socket.id)

      timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        reject(new Error('socket connect timeout'))
      }, timeout)

      intervalId = setInterval(() => {
        if (socket.id) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          resolve(socket.id)
        }
      }, 200)
    })
  }

  return {
    connect,
    disconnect,
    getId
  }
}

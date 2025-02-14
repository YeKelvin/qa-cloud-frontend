import { io } from 'socket.io-client'

/**
 * 默认 socket 连接地址
 */
const DEFAULT_URL = import.meta.env.VITE_APP_BASE_SOCKET

/**
 * 默认 socket 配置
 */
const DEFAULT_OPTIONS = {
  autoConnect: false,
  transports: import.meta.env.VITE_APP_ENV === 'production' ? ['websocket', 'polling'] : ['polling']
}

/**
 * 默认调试模式
 */
const DEBUG = import.meta.env.VITE_APP_ENV === 'development'

/**
 * 插件安装
 */
export default {
  install: (app, connection = DEFAULT_URL, debug = DEBUG, options = DEFAULT_OPTIONS) => {
    const socket = io(connection, options)
    app.config.globalProperties.$socket = socket
    app.provide('socket', socket)

    if (debug) {
      socket.onAny((event, ...args) => {
        console.log(`event:[ ${event} ]`, args)
      })
    }

    /**
     * 在连接成功时触发
     */
    // socket.on('connect', () => {
    //   console.debug(`event:[ connect ] sid:[ ${socket.id} ] `)
    // })

    /**
     * 断开连接时触发
     */
    // socket.on('disconnect', () => {
    //   console.debug(`event:[ disconnect ] sid:[ ${socket.id} ] `)
    // })

    /**
     * 连接错误时触发
     */
    socket.on('connect_error', error => {
      console.error(`event:[ connect_error ]\n${error}`)
      socket.close()
    })

    /**
     * 发生错误时触发
     */
    socket.on('error', error => {
      console.error(`event:[ error ] sid:[ ${socket.id} ]\n${error}`)
      socket.close()
    })
  }
}

//  vue
import App from './App'

// pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// vue-query
import { VueQueryPlugin as VueQuery } from '@tanstack/vue-query'

// vue-router
import Router from './router'
// 导航守卫
import './permission'

// element-ui
import ElementPlus from 'element-plus'
import chinese from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

// socket-io
import SocketIO from '@/plugins/socketio'

// 自定义组件
import components from '@/components'
// 自定义指令
import directive from '@/directives'

// 国际化
import 'dayjs/locale/zh-cn'

// 全局样式
import '@/styles/index.scss'

// 创建 pinia 实例
const pinia = createPinia()
// 注册 pinia 插件
pinia.use(piniaPluginPersistedstate)

// 创建 vue 实例
const app = createApp(App)
// 注册 vue 插件
app.use(pinia)
app.use(Router)
app.use(VueQuery)
app.use(SocketIO)
app.use(ElementPlus, { locale: chinese })
// 全局注册自定义组件
components(app)
// 全局注册自定义指令
directive(app)

// 全局异常处理
app.config.errorHandler = (err, vm, info) => {
  console.error(`Catch error at ${info}:\n`, err)
}

// 挂载实例
app.mount('#app')

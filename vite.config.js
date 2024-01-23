import { defineConfig, loadEnv } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import DefineOptions from 'unplugin-vue-define-options/vite'
import VueDevTools from 'vite-plugin-vue-devtools'

export default ({ mode }) =>
  defineConfig({
    base: loadEnv(mode, process.cwd()).VITE_PUBLIC_PATH,
    define: {
      'process.platform': null,
      'process.version': null
    },
    clearScreen: false,
    plugins: [
      // VueDevTools(),
      vue(),
      jsx(),
      Icons({
        autoInstall: true
      }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [
          // 自动导入 Element Plus 函数 ( ElMessage, ElMessageBox )
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon'
          })
        ],
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true
        }
      }),
      Components({
        resolvers: [
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ['ep']
          })
          // 自动导入 Element Plus 组件
          // ElementPlusResolver()
        ]
      }),
      DefineOptions(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]'
      })
    ],
    server: {
      // host: '0.0.0.0', // 设置外网访问
      port: 9529, // 服务器端口
      open: false, // 启动时自动在浏览器中打开应用程序
      cors: true // 跨域
    },
    build: {
      minify: 'esbuild',
      // chunk 大小警告的限制（以 kbs 为单位）
      chunkSizeWarningLimit: 2000,
      // 指定生成静态资源的存放路径
      assetsDir: 'static/assets',
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name].[hash].js',
          entryFileNames: 'static/js/[name].[hash].js',
          assetFileNames: 'static/[ext]/[name].[hash].[ext]',
          manualChunks: {
            vue: ['vue', 'vue-router'],
            echarts: ['echarts'],
            editorWorker: ['monaco-editor/esm/vs/editor/editor.worker'],
            jsonWorker: ['monaco-editor/esm/vs/language/json/json.worker'],
            htmlWorker: ['monaco-editor/esm/vs/language/html/html.worker']
          }
        }
      }
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, 'src')
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";'
        }
      }
    },
    optimizeDeps: {
      include: [
        'monaco-editor/esm/vs/editor/editor.worker',
        'monaco-editor/esm/vs/language/json/json.worker',
        'monaco-editor/esm/vs/language/html/html.worker'
      ]
    }
  })

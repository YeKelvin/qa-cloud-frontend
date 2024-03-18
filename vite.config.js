import { defineConfig, loadEnv } from 'vite'
import { vitePluginForArco } from '@arco-plugins/vite-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import { ElementPlusResolver, ArcoResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import Icons from 'unplugin-icons/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import IconsResolver from 'unplugin-icons/resolver'

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
      vitePluginForArco({ style: 'css' }),
      Icons({ autoInstall: true }),
      AutoImport({
        imports: ['vue', /** 'vue-router', */ 'pinia', VueRouterAutoImports],
        resolvers: [
          // 按需加载 Arco
          ArcoResolver(),
          // 按需加载 Icons
          IconsResolver({ prefix: 'Icon' }),
          // 按需加载 ElementPlus
          ElementPlusResolver()
        ],
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true
        }
      }),
      Components({
        dts: false,
        resolvers: [
          // 按需加载 Arco
          ArcoResolver({ sideEffect: true }),
          // 按需加载 Icons
          IconsResolver({ enabledCollections: ['ep'] }),
          // 按需加载 ElementPlus
          ElementPlusResolver()
        ]
      }),
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

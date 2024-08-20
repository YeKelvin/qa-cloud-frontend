import path from 'path'

import pluginVue from '@vitejs/plugin-vue'
import pluginVueJsx from '@vitejs/plugin-vue-jsx'
import unpluginAutoImport from 'unplugin-auto-import/vite'
import unpluginComponents from 'unplugin-vue-components/vite'
import unpluginIcons from 'unplugin-icons/vite'
import unpluginIconsResolver from 'unplugin-icons/resolver'
import { defineConfig, loadEnv } from 'vite'
import { ElementPlusResolver, ArcoResolver } from 'unplugin-vue-components/resolvers'
import { vitePluginForArco as pluginArco } from '@arco-plugins/vite-vue'
import { VueRouterAutoImports as unpluginVueRouter } from 'unplugin-vue-router'
import { createSvgIconsPlugin as pluginSvgIcons } from 'vite-plugin-svg-icons'
import pluginDevTools from 'vite-plugin-vue-devtools'

export default ({ mode }) =>
  defineConfig({
    base: loadEnv(mode, process.cwd()).VITE_PUBLIC_PATH,
    define: {
      'process.platform': null,
      'process.version': null
    },
    clearScreen: false,
    plugins: [
      pluginVue(),
      pluginVueJsx(),
      pluginDevTools(),
      pluginArco({ style: 'css' }),
      unpluginIcons({ autoInstall: true }),
      unpluginAutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        imports: [
          'vue',
          /** 'vue-router', */
          'pinia',
          unpluginVueRouter,
          {
            'axios': [
              // default imports
              ['default', 'axios'], // import { default as axios } from 'axios',
            ],
              '[package-name]': [
                '[import-names]',
                // alias
                ['[from]', '[alias]'],
              ]
          },
          {
            from: 'vue-router',
            imports: ['RouteLocationRaw'],
            type: true,
          }
        ],
        resolvers: [
          // 按需加载 Arco
          ArcoResolver(),
          // 按需加载 Icons
          unpluginIconsResolver({ prefix: 'Icon' }),
          // 按需加载 ElementPlus
          ElementPlusResolver()
        ],
        eslintrc: {
          enabled: true,
          filepath: './eslint-auto-import.json',
          globalsPropValue: true
        },
        vueTemplate: true,
        viteOptimizeDeps: true
      }),
      unpluginComponents({
        dts: false,
        resolvers: [
          // 按需加载 Arco
          ArcoResolver({ sideEffect: true }),
          // 按需加载 Icons
          unpluginIconsResolver({ enabledCollections: ['ep'] }),
          // 按需加载 ElementPlus
          ElementPlusResolver()
        ]
      }),
      pluginSvgIcons({
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
        // eslint-disable-next-line unicorn/prefer-module
        '~': path.resolve(__dirname, './'),
        // eslint-disable-next-line unicorn/prefer-module
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

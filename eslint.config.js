import globals from 'globals'
import autoImports from './eslint-auto-import.json' with { type: 'json' }
import pluginJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginUnicorn from 'eslint-plugin-unicorn'
import pluginPromise from 'eslint-plugin-promise'
import pluginStylistic from '@stylistic/eslint-plugin'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

/** @type {import('eslint').Config} */
export default [
  /** js 推荐配置 */
  pluginJs.configs.recommended,
  /** prettier 配置 */
  pluginPrettierRecommended,
  /** stylistic 推荐配置 */
  pluginStylistic.configs['recommended-flat'],
  /** promise 推荐配置 */
  pluginPromise.configs['flat/recommended'],
  /** unicorn 推荐配置 */
  pluginUnicorn.configs['flat/recommended'],
  /** vue 推荐配置 */
  ...pluginVue.configs['flat/recommended'],
  /** oxlint 配置 */
  pluginOxlint.configs['flat/recommended'],

  {
    ignores: [
      '.idea',
      '.husky',
      '.vscode',
      'dist',
      'build',
      'public',
      'node_modules',
      '*.md',
      '*.lock',
      'vite.config.js',
      'eslint.config.js',
      'stylelint.config.js'
    ]
  },

  /**
   * 配置全局变量
   */
  {
    languageOptions: {
      globals: {
        // sourceType: 'module',

        ...globals.browser,
        ...autoImports.globals,

        /** 自定义全局规则 */
        defineEmits: true,
        defineProps: true,
        defineExpose: true,
        defineOptions: true
      }
    }
  },

  /**
   * javascript 规则
   */
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    rules: {
      'no-var': 'error',
      'no-void': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-bitwise': 'off',
      'no-console': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-plusplus': 'off',
      'no-param-reassign': ['off'],
      'no-unused-vars': ['error', { varsIgnorePattern: '.*', args: 'none' }],
      'no-unexpected-multiline': 'error',
      'no-useless-escape': 'off',
      'no-useless-return': 'off',
      'no-multiple-empty-lines': ['warn', { max: 2 }],
      'no-async-promise-executor': 'off',
      'no-template-curly-in-string': 'off',
      'prefer-const': ['warn', { destructuring: 'all', ignoreReadBeforeAssign: true }],
      'prefer-template': 'error',
      'block-scoped-var': 'error',
      'linebreak-style': ['error', 'unix'],
      'object-shorthand': 'off',
      'space-before-function-paren': 0
    }
  },

  /**
   * promise 规则
   */
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    rules: {
      'promise/always-return': 'off',
      'promise/catch-or-return': 'off',
      'promise/no-nesting': 'off'
    }
  },

  /**
   * unicorn 规则
   */
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    rules: {
      'unicorn/filename-case': 'off',
      'unicorn/prefer-ternary': ['error', 'only-single-line'],
      'unicorn/prevent-abbreviations': 'off'
    }
  },

  /**
   * stylistic 规则
   */
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    rules: {
      '@stylistic/arrow-parens': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/comma-dangle': 'off'
    }
  },

  /**
   * import 规则
   */
  // {
  //   files: ['**/*.{js,mjs,cjs,vue}'],
  //   rules: {
  //     'import/first': 'error',
  //     'import/extensions': 'off',
  //     'import/newline-after-import': ['error', { 'count': 1 }],
  //     'import/no-duplicates': 'error',
  //     'import/no-unresolved': [0],
  //     'import/no-absolute-path': 'off',
  //     'import/no-named-as-default': 'off',
  //     'import/no-extraneous-dependencies': 'off',
  //     'import/order': [
  //       'error',
  //       {
  //         'groups': ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'object', 'type', 'unknown'],
  //         'newlines-between': 'always',
  //         'alphabetize': {
  //           'order': 'asc',
  //           'orderImportKind': 'asc',
  //           'caseInsensitive': false
  //         }
  //       }
  //     ],
  //   }
  // },

  /**
   * vue 规则
   */
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/no-v-html': 'off',
      'vue/no-v-text-v-html-on-component': 'off',
      'vue/prefer-import-from-vue': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: {
            max: 10
          }
        }
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ]
    }
  }
]

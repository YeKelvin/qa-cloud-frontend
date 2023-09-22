module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  globals: {
    document: true,
    window: true,
    localStorage: true,
    defineEmits: true,
    defineProps: true,
    defineExpose: true,
    defineOptions: true
  },
  plugins: ['prettier', 'import', 'promise'],
  extends: [
    'standard',
    'prettier',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
    'plugin:vue/vue3-recommended',
    './.eslintrc-auto-import.json'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
    ecmaFeatures: {
      jsx: true,
      tsx: true
    },
    vueFeatures: {}
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      env: {
        jest: true
      }
    }
  ],
  rules: {
    // js
    'no-var': 'error', // 要求使用 let 或 const 而不是 var
    'no-void': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-bitwise': 'off',
    'no-console': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-plusplus': 'off',
    'no-param-reassign': ['off'],
    'no-unused-vars': ['error', { varsIgnorePattern: '.*', args: 'none' }],
    'no-unexpected-multiline': 'error', // 禁止空余的多行
    'no-useless-escape': 'off', // 禁止不必要的转义字符
    'no-useless-return': 'off',
    'no-multiple-empty-lines': ['warn', { max: 2 }], // 不允许多个空行
    'no-async-promise-executor': 'off',
    'prefer-const': ['warn', { destructuring: 'all', ignoreReadBeforeAssign: true }],
    'prefer-template': 'error',
    'block-scoped-var': 'error',
    'linebreak-style': ['error', 'unix'],
    'object-shorthand': 'off',
    'space-before-function-paren': 0,

    // vue
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/prefer-import-from-vue': 'off',
    'vue/no-v-text-v-html-on-component': 'off',
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
    ],

    // prettier
    'prettier/prettier': 'error',

    // import
    'import/first': 'error',
    'import/extensions': 'off',
    'import/no-duplicates': 'error',
    'import/no-unresolved': [0],
    'import/no-absolute-path': 'off',
    'import/no-named-as-default': 'off',
    'import/no-extraneous-dependencies': 'off'
  }
}

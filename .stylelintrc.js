// @see https://stylelint.bootcss.com/

module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier',
    'stylelint-config-recess-order',
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue/scss',
    'stylelint-config-standard-vue'
  ],
  overrides: [
    {
      files: ['**/*.(scss|css|vue|html)'],
      customSyntax: 'postcss-scss',
    },
    {
      files: ['**/*.(html|vue)'],
      customSyntax: 'postcss-html',
    },
  ],
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.ts',
    '**/*.json',
    '**/*.md',
    '**/*.yaml',
  ],
  /**
   * null  => 关闭该规则
   * always => 必须
   */
  rules: {
    'no-empty-source': null, // 关闭禁止空源码
    'no-descending-specificity': null, // 禁止在具有较高优先级的选择器后出现被其覆盖的较低优先级的选择器
    'function-url-quotes': 'always', // 要求或禁止 URL 的引号 "always(必须加上引号)"|"never(没有引号)"
    'value-keyword-case': null, // 在 css 中使用 v-bind，不报错
    'value-no-vendor-prefix': null, // 关闭 属性值前缀 --webkit-box
    'property-no-unknown': null, // 禁止未知的属性(true 为不允许)
    'property-no-vendor-prefix': null, // 关闭 属性前缀 -webkit-mask
    'selector-class-pattern': null, // 关闭强制选择器类名的格式
    'selector-pseudo-class-no-unknown': [
      true, // 不允许未知的选择器
      {
        ignorePseudoClasses: ['global', 'v-deep', 'deep', 'export'], // 忽略属性，修改element默认样式的时候能使用到
      },
    ],
  },
}

/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recess-order',
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue/scss'
  ],
  overrides: [
    {
      files: ['**/*.(scss|css|vue|html)'],
      customSyntax: 'postcss-scss'
    },
    {
      files: ['**/*.(html|vue)'],
      customSyntax: 'postcss-html'
    }
  ],
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.ts',
    '**/*.json',
    '**/*.md',
    '**/*.yaml',
    '/node_modules/*',
    '/dist/*',
    '/html/*',
    '/public/*'
  ],
  rules: {
    'function-url-quotes': 'always',
    'no-empty-source': null,
    'no-descending-specificity': null,
    'value-keyword-case': null,
    'value-no-vendor-prefix': null,
    'import-notation': 'string',
    'property-no-unknown': null,
    'property-no-vendor-prefix': null,
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'v-deep', 'deep', 'export']
      }
    ]
  }
}

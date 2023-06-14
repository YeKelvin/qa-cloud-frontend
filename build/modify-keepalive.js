// https://github.com/vuejs/core/pull/4339#issuecomment-1061855701
const fs = require('fs')
const path = require('path')
const vue_bundler_file = path.resolve(__dirname, '../node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js')
fs.readFile(vue_bundler_file, 'utf8', function (err, data) {
  if (err) console.error(err)
  const orginal_str =
    '    if (!!(process.env.NODE_ENV !== "production") || __VUE_PROD_DEVTOOLS__) {\n      instance.__v_cache = cache;\n    }'
  const target_str =
    '    // if (!!(process.env.NODE_ENV !== "production") || __VUE_PROD_DEVTOOLS__) {\n      instance.__v_cache = cache;\n    // }'
  const result = data.replace(orginal_str, target_str)
  fs.writeFile(vue_bundler_file, result, 'utf8', function (err) {
    if (err) return console.error(err)
  })
})

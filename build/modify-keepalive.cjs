// https://github.com/vuejs/core/pull/4339#issuecomment-1061855701
const fs = require('fs')
const path = require('path')

const bundlerFile = path.resolve(__dirname, '../node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js')

fs.readFile(bundlerFile, 'utf8', function (err, data) {
  if (err) console.error(err)
  const orginalStr =
    '    if (!!(process.env.NODE_ENV !== "production") || __VUE_PROD_DEVTOOLS__) {\n      instance.__v_cache = cache;\n    }'
  const targetStr =
    '    // if (!!(process.env.NODE_ENV !== "production") || __VUE_PROD_DEVTOOLS__) {\n      instance.__v_cache = cache;\n    // }'
  const result = data.replace(orginalStr, targetStr)
  fs.writeFile(bundlerFile, result, 'utf8', function (err) {
    if (err) return console.error(err)
  })
})

import { language } from 'monaco-editor/esm/vs/basic-languages/python/python.js'

import monaco from '../monaco.base.js'

const PYTHON_LANG_DEFINE = { ...language }
PYTHON_LANG_DEFINE.tokenizer.root.push(
  [/\${\w+[()]*}/, { token: 'pymeter-function' }],
  [/(\${__\w+\()[\s\w$(),{}]+(\)})/, { token: 'pymeter-function' }]
)

const PYTHON_LANG_COLORS = [{ token: 'pymeter-function', foreground: 'FF0000' }]

const PYTHON_KEYWORD_COMPLETIONS = (range, word) => {
  console.log('PYTHON_KEYWORD_COMPLETIONS')
  const keywords = []
  // 添加所有的python关键字补全
  language.keywords.forEach((item) => {
    if (!item.includes(word)) return
    keywords.push({
      label: item,
      insertText: item,
      kind: monaco.languages.CompletionItemKind.Keyword,
      range: range
    })
  })
  return keywords
}

export { PYTHON_KEYWORD_COMPLETIONS, PYTHON_LANG_DEFINE, PYTHON_LANG_COLORS }

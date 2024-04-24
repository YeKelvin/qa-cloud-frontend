// 入口是 monaco-editor/esm/vs/editor/edcore.main.js

import 'monaco-editor/esm/vs/editor/editor.all.js'

import 'monaco-editor/esm/vs/language/css/monaco.contribution.js'
import 'monaco-editor/esm/vs/language/html/monaco.contribution.js'
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js'
// import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js'

// import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js'
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js'
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js'
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js'
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js'

// eslint-disable-next-line import/order
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

import { JSON5_LANG_DEFINE, JSON5_LANG_CONFIG } from './language/json5'
import { LOG_LANG_DEFINE, LOG_LANG_COLORS } from './language/log'
import { PYMETER_KEYWORD_COMPLETIONS, PYMETER_FUNCTION_COMPLETIONS } from './language/pymeter'
import { PYTHON_LANG_DEFINE, PYTHON_LANG_COLORS, PYTHON_KEYWORD_COMPLETIONS } from './language/python'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      // eslint-disable-next-line new-cap
      return new jsonWorker()
    }
    // if (label === 'css' || label === 'scss' || label === 'less') {
    //   return new cssWorker()
    // }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      // eslint-disable-next-line new-cap
      return new htmlWorker()
    }
    // if (label === 'typescript' || label === 'javascript') {
    //   return new tsWorker()
    // }
    // eslint-disable-next-line new-cap
    return new editorWorker()
  }
}

const COMPLETION_PROVIDERS = []

/**
 * 注册代码提示
 */
const registerCompletion = (language, provider, triggerCharacters = null) => {
  monaco.languages.registerCompletionItemProvider(language, {
    triggerCharacters: triggerCharacters,
    provideCompletionItems: (model, position) => {
      const wordPos = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordPos.startColumn - 1,
        endColumn: wordPos.endColumn
      }
      return { suggestions: provider(range, wordPos.word) }
    }
  })
}
// *************************************************************************
// * json5
// *************************************************************************
monaco.languages.register({ id: 'json5' })
monaco.languages.setMonarchTokensProvider('json5', JSON5_LANG_DEFINE)
monaco.languages.setLanguageConfiguration('json5', JSON5_LANG_CONFIG)

// *************************************************************************
// * log
// *************************************************************************
monaco.languages.register({ id: 'log' })
monaco.languages.setMonarchTokensProvider('log', LOG_LANG_DEFINE)

// *************************************************************************
// * python
// *************************************************************************
monaco.languages.setMonarchTokensProvider('python', PYTHON_LANG_DEFINE)
registerCompletion('python', PYTHON_KEYWORD_COMPLETIONS)
registerCompletion('python', PYMETER_KEYWORD_COMPLETIONS)
registerCompletion('python', PYMETER_FUNCTION_COMPLETIONS, '$')

// *************************************************************************
// * theme
// *************************************************************************
monaco.editor.defineTheme('vs', {
  base: 'vs',
  inherit: true,
  rules: [
    {
      fontStyle: 'bold',
      token: 'delimiter.parenthesis.js'
    },
    {
      fontStyle: 'bold',
      token: 'delimiter.bracket.js'
    },
    ...LOG_LANG_COLORS,
    ...PYTHON_LANG_COLORS
  ],
  colors: {
    'editorBracketHighlight.foreground1': '#FF0000', // 红
    'editorBracketHighlight.foreground2': '#DA70D6',
    'editorBracketHighlight.foreground3': '#87CEFA',
    'editorBracketHighlight.foreground4': '#FFD700', // 黄
    'editorBracketHighlight.foreground5': '#DA70D6',
    'editorBracketHighlight.foreground6': '#87CEFA',
    'editorBracketHighlight.unexpectedBracket.foreground': '#FF0000'
  }
})

export default monaco

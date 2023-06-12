// 入口是 monaco-editor/esm/vs/editor/edcore.main.js

// import * as monaco from 'monaco-editor'

import 'monaco-editor/esm/vs/editor/editor.all.js'

import 'monaco-editor/esm/vs/language/css/monaco.contribution.js'
import 'monaco-editor/esm/vs/language/html/monaco.contribution.js'
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js'

import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js'
// import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js'
// import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import { LOG_LANGUAGE_DEFINE, LOG_TOKEN_COLORS } from './language/log'
import { PYMETER_COMPLETION_ITEMS, PYMETER_FUNCTION_COMPLETION_ITEMS } from './language/pymeter'
import { PYTHON_LANGUAGE_DEFINE, PYTHON_TOKEN_COLORS, PYTHON_KEYWORDS_COMPLETION_ITEMS } from './language/python'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    // if (label === 'css' || label === 'scss' || label === 'less') {
    //   return new cssWorker()
    // }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    // if (label === 'typescript' || label === 'javascript') {
    //   return new tsWorker()
    // }
    return new editorWorker()
  }
}

/**
 * 注册代码提示
 */
const registerCompletion = (language, provider, triggerCharacters = null) => {
  monaco.languages.registerCompletionItemProvider(language, {
    triggerCharacters: triggerCharacters,
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }
      return { suggestions: provider(range) }
    }
  })
}

// ********************************************************************************************************************
// * log
// ********************************************************************************************************************
monaco.languages.register({ id: 'log' })
monaco.languages.setMonarchTokensProvider('log', LOG_LANGUAGE_DEFINE)

// ********************************************************************************************************************
// * python
// ********************************************************************************************************************
monaco.languages.setMonarchTokensProvider('python', PYTHON_LANGUAGE_DEFINE)
registerCompletion('python', PYTHON_KEYWORDS_COMPLETION_ITEMS)
registerCompletion('python', PYMETER_COMPLETION_ITEMS)
registerCompletion('python', PYMETER_FUNCTION_COMPLETION_ITEMS)

// ********************************************************************************************************************
// * theme
// ********************************************************************************************************************
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
    ...LOG_TOKEN_COLORS,
    ...PYTHON_TOKEN_COLORS
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

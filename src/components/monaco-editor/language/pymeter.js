import monaco from '../monaco.base.js'

const PYMETER_COMPLETION_ITEMS = (range) => {
  return [
    {
      label: 'vars.put',
      detail: '设置局部变量',
      insertText: "vars.put('${1:name}', '${2:value}')",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Method,
      range: range
    },
    {
      label: 'vars.get',
      detail: '获取局部变量',
      insertText: "vars.get('${1:name}')",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Method,
      range: range
    },
    {
      label: 'props.put',
      detail: '设置全部变量',
      insertText: "props.put('${1:name}', '${2:value}')",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Method,
      range: range
    },
    {
      label: 'props.get',
      detail: '获取全局变量',
      insertText: "props.get('${1:name}')",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Method,
      range: range
    }
  ]
}

const PYMETER_FUNCTION_COMPLETION_ITEMS = (range) => {
  return [
    {
      label: '${__Eval()}',
      detail: 'Eval',
      insertText: '${__Eval(${1:name})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__GoogleAuth()}',
      detail: 'GoogleAuth',
      insertText: '${__GoogleAuth(${1:secretKey})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__MD5()}',
      detail: 'MD5',
      insertText: '${__MD5(${1:plaintext})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__RandomChoice()}',
      detail: 'RandomChoice',
      insertText: '${__RandomChoice(${1:str})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__RandomInt()}',
      detail: 'RandomInt',
      insertText: '${__RandomInt(${1:minimum}, ${2:maximum})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__Random()}',
      detail: 'Random',
      insertText: '${__Random(${1:length})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__RSA()}',
      detail: 'RSA',
      insertText: '${__RSA(${1:plaintext}, ${2:publicKey})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__Time()}',
      detail: 'Time',
      insertText: '${__Time(${1:format})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    }
  ]
}

export { PYMETER_COMPLETION_ITEMS, PYMETER_FUNCTION_COMPLETION_ITEMS }

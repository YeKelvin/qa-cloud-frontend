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
      label: '${__fake()}',
      detail: 'fake',
      insertText: '${__fake(${1:provider})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__ulid()}',
      detail: 'ulid',
      insertText: '${__ulid()}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__eval()}',
      detail: 'eval',
      insertText: '${__eval(${1:name})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__google_auth()}',
      detail: 'google_auth',
      insertText: '${__GoogleAuth(${1:secretKey})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__md5()}',
      detail: 'md5',
      insertText: '${__md5(${1:plaintext})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__random_choice()}',
      detail: 'random_choice',
      insertText: '${__random_choice(${1:str})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__random_int()}',
      detail: 'random_int',
      insertText: '${__random_int(${1:minimum}, ${2:maximum})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__random()}',
      detail: 'random',
      insertText: '${__random(${1:length})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__rsa()}',
      detail: 'rsa',
      insertText: '${__rsa(${1:plaintext}, ${2:publicKey})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    },
    {
      label: '${__time()}',
      detail: 'time',
      insertText: '${__time(${1:format})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      range: range
    }
  ]
}

export { PYMETER_COMPLETION_ITEMS, PYMETER_FUNCTION_COMPLETION_ITEMS }

import { language } from 'monaco-editor/esm/vs/basic-languages/python/python.js'

import monaco from '../monaco.base.js'

const PYTHON_LANG_DEFINE = { ...language }
PYTHON_LANG_DEFINE.tokenizer.root.push(
  [/\${\w+}/, { token: 'pymeter-function' }],
  [/(\${__\w+\()[\s\w$(),{}]+(\)})/, { token: 'pymeter-function' }]
)

const PYTHON_LANG_COLORS = [{ token: 'pymeter-function', foreground: 'FF0000' }]

const PYTHON_KEYWORDS = [
  'and',
  'as',
  'assert',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'exec',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'None',
  'not',
  'or',
  'pass',
  'print',
  'raise',
  'return',
  'self',
  'try',
  'while',
  'with',
  'yield',
  'int',
  'float',
  'long',
  'complex',
  'hex',
  'abs',
  'all',
  'any',
  'apply',
  'basestring',
  'bin',
  'bool',
  'buffer',
  'bytearray',
  'callable',
  'chr',
  'classmethod',
  'cmp',
  'coerce',
  'compile',
  'complex',
  'delattr',
  'dict',
  'dir',
  'divmod',
  'enumerate',
  'eval',
  'execfile',
  'file',
  'filter',
  'format',
  'frozenset',
  'getattr',
  'globals',
  'hasattr',
  'hash',
  'help',
  'id',
  'input',
  'intern',
  'isinstance',
  'issubclass',
  'iter',
  'len',
  'locals',
  'list',
  'map',
  'max',
  'memoryview',
  'min',
  'next',
  'object',
  'oct',
  'open',
  'ord',
  'pow',
  'print',
  'property',
  'reversed',
  'range',
  'raw_input',
  'reduce',
  'reload',
  'repr',
  'reversed',
  'round',
  'set',
  'setattr',
  'slice',
  'sorted',
  'staticmethod',
  'str',
  'sum',
  'super',
  'tuple',
  'type',
  'unichr',
  'unicode',
  'vars',
  'xrange',
  'zip',
  'True',
  'False'
]

const PYTHON_KEYWORDS_COMPLETIONS = (range) => {
  const keywords = []
  PYTHON_KEYWORDS.forEach((item) => {
    keywords.push({
      label: item,
      insertText: item,
      kind: monaco.languages.CompletionItemKind.Keyword,
      range: range
    })
  })
  return keywords
}

export { PYTHON_KEYWORDS_COMPLETIONS, PYTHON_LANG_DEFINE, PYTHON_LANG_COLORS }

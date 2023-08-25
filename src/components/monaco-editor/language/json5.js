const JSON5_LANG_DEFINE = {
  tokenizer: {
    root: [
      [/{\s*/, 'delimiter.bracket'],
      [/}\s*/, 'delimiter.bracket'],
      [/\[/, 'delimiter.square'],
      [/\]/, 'delimiter.square'],
      [/:\s*/, 'delimiter.colon'],
      [/,/, 'delimiter.comma'],
      [/true|false|null/, 'constant'],
      [/"(?:[^\\\"]|\\.)*"/, 'string'],
      [/'(?:[^\\\']|\\.)*'/, 'string'],
      [/-?(0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/, 'number'],
      [/\/\/.*/, 'comment'],
      [/\/\*[\s\S]*?\*\//, 'comment']
    ]
  },
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']']
  ],
  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string'] },
    { open: '[', close: ']', notIn: ['string'] },
    { open: '(', close: ')', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string'] },
    { open: '/*', close: '*/', notIn: ['string'] },
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: '`', close: '`', notIn: ['string', 'comment'] }
  ]
}

export { JSON5_LANG_DEFINE }

const JSON5_LANG_CONFIG = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']']
  ],
  autoClosingPairs: [
    { open: '/*', close: '*/', notIn: ['string'] },
    { open: '{', close: '}', notIn: ['string'] },
    { open: '[', close: ']', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string'] },
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: '`', close: '`', notIn: ['string', 'comment'] }
  ]
}

const JSON5_LANG_DEFINE = {
  tokenizer: {
    root: [
      [/{\s*/, 'delimiter.bracket'],
      [/}\s*/, 'delimiter.bracket'],
      [/\[/, 'delimiter.square'],
      [/]/, 'delimiter.square'],
      [/:\s*/, 'delimiter.colon'],
      [/,/, 'delimiter.comma'],
      [/true|false|null/, 'constant'],
      [/"(?:[^"\\]|\\.)*"/, 'string'],
      [/'(?:[^'\\]|\\.)*'/, 'string'],
      [/-?(0|[1-9]\d*)(?:\.\d+)?(?:[Ee][+-]?\d+)?/, 'number'],
      [/\/\/.*/, 'comment'],
      [/\/\*[\S\s]*?\*\//, 'comment']
    ]
  }
}

export { JSON5_LANG_CONFIG, JSON5_LANG_DEFINE }

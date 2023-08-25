const LOG_LANG_DEFINE = {
  inherit: true,
  ignoreCase: true,
  logTime: /(\[[\d-:. ]*\])?\s?/,
  logLevel: /\[(ERROR|WARNING|INFO|DEBUG)?\]/,
  tokenizer: {
    root: [
      [/@logTime\[DEBUG\]/, { token: 'debug-log', next: '@text.debug' }],
      [/@logTime\[INFO\]/, { token: 'info-log', next: '@text.info' }],
      [/@logTime\[WARNING\]/, { token: 'warning-log', next: '@text.warning' }],
      [/@logTime\[ERROR\]/, { token: 'error-log', next: '@text.error' }]
    ],
    text: [
      [/@logTime@logLevel/, { token: '@rematch', next: '@pop' }],
      [/.*/, { token: '$S2-log' }]
    ]
  }
}

const LOG_TOKEN_COLORS = [
  { token: 'log-time', foreground: '409EFF' },
  { token: 'debug-log', foreground: '808080' },
  { token: 'info-log', foreground: '606266' },
  { token: 'warning-log', foreground: 'FFA500' },
  { token: 'error-log', foreground: 'FF0000' }
]

export { LOG_LANG_DEFINE, LOG_TOKEN_COLORS }

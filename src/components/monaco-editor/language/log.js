const LOG_LANGUAGE_DEFINE = {
  ignoreCase: true,
  inherit: true,
  tokenizer: {
    root: [
      [/^\[[0-9-:. ]+?\]/, { token: 'log-time' }],
      [/\[DEBUG\].*/, { token: 'debug-log' }],
      [/\[INFO\].*/, { token: 'info-log' }],
      [/\[WARNING\].*/, { token: 'warning-log' }],
      [/\[ERROR\].*/, { token: 'error-log' }],
      [/\[CRITICAL\].*/, { token: 'critical-log' }]
    ]
  }
}

const LOG_TOKEN_COLORS = [
  { token: 'log-time', foreground: '409EFF' },
  { token: 'debug-log', foreground: '808080' },
  { token: 'info-log', foreground: '606266' },
  { token: 'warning-log', foreground: 'FFA500' },
  { token: 'error-log', foreground: 'FF0000' },
  { token: 'critical-log', foreground: 'FF0000' }
]

export { LOG_LANGUAGE_DEFINE, LOG_TOKEN_COLORS }

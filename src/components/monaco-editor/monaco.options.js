// monaco 默认配置
const DEFAULT_OPTIONS = {
  // 自动关闭括号
  autoClosingBrackets: 'always',
  // 自动关闭引号
  autoClosingQuotes: 'always',
  // 启用自动缩进调整
  autoIndent: 'advanced',
  // 自适应布局
  automaticLayout: true,
  // 括号高亮
  'bracketPairColorization.enabled': true,
  // 光标样式
  cursorStyle: 'line',
  // 启用光标平滑插入动画
  cursorSmoothCaretAnimation: true,
  // 右键菜单
  contextmenu: false,
  // 允许拖拽
  dragAndDrop: true,
  // 粘贴时格式化
  formatOnPaste: true,
  // 输入时格式化
  formatOnType: true,
  // 开启折叠
  folding: true,
  foldingHighlight: true,
  fixedOverflowWidgets: true,
  highlightActiveIndentGuide: true,
  // 显示行号的位数
  lineNumbersMinChars: 4,
  // 开启行号边距，默认 false
  glyphMargin: false,
  // 括号高亮
  guides: { bracketPairs: 'active' },
  // 小地图
  minimap: { enabled: false },
  // 自动匹配括号
  matchBrackets: 'always',
  // 快速建议显示
  quickSuggestions: true,
  // 快速建议显示延迟（ms），默认 500ms
  quickSuggestionsDelay: 250,
  // 使用圆角边框渲染编辑器选择，默认 true
  roundedSelection: false,
  renderFinalNewline: true,
  renderIndentGuides: true,
  renderLineHighlight: 'all',
  renderWhitespace: 'all',
  // 滚动配置
  scrollbar: {
    // 编辑器滚动至尽头时，父页面可继续滚动
    alwaysConsumeMouseWheel: false,
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6
  },
  // 单击行号时是否应选择相应的行为，默认 true
  selectOnLineNumbers: true,
  selectionHighlight: true,
  'semanticHighlighting.enabled': true,
  smoothScrolling: true,
  snippetSuggestions: 'top',
  suggestSelection: 'first',
  tabCompletion: 'on',
  // 缩进大小
  tabIndex: 4,
  unicodeHighlight: { ambiguousCharacters: false },
  // 在制表位后插入和删除空格
  useTabStops: false,
  wrappingIndent: 'same'
}

export default DEFAULT_OPTIONS

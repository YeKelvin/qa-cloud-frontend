const EDITOR_PROPS = {
  editorNo: { type: String, default: '' },
  editorMode: { type: String, default: 'QUERY' },
  metadata: { type: Object, default: () => {} }
}

export default EDITOR_PROPS

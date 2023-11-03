const EDITOR_PROPS = {
  closing: { type: Boolean, default: false },
  unsaved: { type: Boolean, default: false },
  metadata: { type: Object, default: () => {} },
  editorNo: { type: String, default: '' },
  editorMode: { type: String, default: 'QUERY' }
}

export default EDITOR_PROPS

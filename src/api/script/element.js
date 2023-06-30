import request from '@/utils/request'

export const queryElementList = (params) => request.get('/script/element/list', { params: params })

export const queryElementAll = (params) => request.get('/script/element/all', { params: params })

export const queryElementAllInPrivate = (params) => request.get('/script/element/all/in/private', { params: params })

export const queryElementAllWithChildren = (params) =>
  request.get('/script/element/all/with/children', { params: params })

export const queryElementInfo = (params) => request.get('/script/element/info', { params: params })

export const queryElementChildren = (params) => request.get('/script/element/children', { params: params })

export const queryElementsChildren = (params) =>
  request.get('/script/elements/children', {
    params: params,
    paramsSerializer: { indexes: null }
  })

export const createCollection = (data) => request.post('/script/collection', data)

export const createElementChild = (data) => request.post('/script/element/child', data)

export const createElementChildren = (data) => request.post('/script/element/children', data)

export const createHttpSampler = (data) => request.post('/script/element/http/sampler', data)

export const modifyElement = (data) => request.put('/script/element', data)

export const modifyHttpSampler = (data) => request.put('/script/element/http/sampler', data)

export const removeElement = (data) => request.delete('/script/element', { data: data })

export const enableElement = (data) => request.put('/script/element/enable', data)

export const disableElement = (data) => request.put('/script/element/disable', data)

export const toggleElementState = (data) => request.put('/script/element/state/toggle', data)

export const moveElement = (data) => request.post('/script/element/move', data)

export const duplicateElement = (data) => request.post('/script/element/duplicate', data)

export const queryHttpheaderTemplateRefs = (params) =>
  request.get('/script/element/httpheader/template/refs', { params: params })

export const createHttpheaderTemplateByRefs = (data) => request.post('/script/element/httpheader/template/refs', data)

export const modifyHttpheaderTemplateByRefs = (data) => request.put('/script/element/httpheader/template/refs', data)

export const queryElementComponents = (params) => request.get('/script/element/components', { params: params })

export const createElementComponents = (data) => request.post('/script/element/components', data)

export const modifyElementComponents = (data) => request.put('/script/element/components', data)

export const pasteElement = (data) => request.post('/script/element/paste', data)

export const copyElementToWorkspace = (data) => request.post('/script/element/collection/copy/to/workspace', data)

export const moveElementToWorkspace = (data) => request.post('/script/element/collection/move/to/workspace', data)

export const queryWorkspaceComponents = (params) =>
  request.get('/script/element/workspace/components', { params: params })

export const setWorkspaceComponents = (data) => request.post('/script/element/workspace/components', data)

export const queryWorkspaceSettings = (params) => request.get('/script/element/workspace/settings', { params: params })

export const setWorkspaceSettings = (data) => request.post('/script/element/workspace/settings', data)

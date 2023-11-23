import request from '@/utils/request'

export const queryElementList = (params) => request.get('/script/element/list', { params })

export const queryElementAll = (params) => request.get('/script/element/all', { params })

export const queryElementAllWithChildren = (params) => request.get('/script/element/all/with/children', { params })

export const queryElementInfo = (params) => request.get('/script/element/info', { params })

export const queryElementTree = (params) => request.get('/script/element/tree', { params })

export const queryElementTreeByRoots = (params) =>
  request.get('/script/element/tree/by/roots', {
    params,
    paramsSerializer: { indexes: null }
  })

export const queryElementComponents = (params) => request.get('/script/element/components', { params })

export const createElement = (data) => request.post('/script/element', data)

export const createElementChild = (data) => request.post('/script/element/child', data)

export const modifyElement = (data) => request.put('/script/element', data)

export const removeElement = (data) => request.delete('/script/element', { data })

export const enableElement = (data) => request.put('/script/element/enable', data)

export const disableElement = (data) => request.put('/script/element/disable', data)

export const toggleElementState = (data) => request.put('/script/element/state/toggle', data)

export const moveElement = (data) => request.post('/script/element/move', data)

export const duplicateElement = (data) => request.post('/script/element/duplicate', data)

export const pasteElement = (data) => request.post('/script/element/paste', data)

export const copyElementToWorkspace = (data) => request.post('/script/element/copy/to/workspace', data)

export const moveElementToWorkspace = (data) => request.post('/script/element/move/to/workspace', data)

export const queryDatabaseEngineAll = (params) => request.get('/script/element/database/engine/all', { params })

import request from '@/utils/request'

export const queryHttpheaderTemplateList = (params) => request.get('/script/httpheader/template/list', { params })

export const queryHttpheaderTemplateAll = (params) => request.get('/script/httpheader/template/all', { params })

export const createHttpheaderTemplate = (data) => request.post('/script/httpheader/template', data)

export const modifyHttpheaderTemplate = (data) => request.put('/script/httpheader/template', data)

export const deleteHttpheaderTemplate = (data) => request.delete('/script/httpheader/template', { data })

export const createHttpHeader = (data) => request.post('/script/http/header', data)

export const modifyHttpHeader = (data) => request.put('/script/http/header', data)

export const deleteHttpHeader = (data) => request.delete('/script/http/header', { data })

export const enableHttpHeader = (data) => request.put('/script/http/header/enable', data)

export const disableHttpHeader = (data) => request.put('/script/http/header/disable', data)

export const queryHttpHeadersByTemplate = (params) => request.get('/script/http/headers/by/template', { params })

export const queryHttpHeaders = (params) =>
  request.get('/script/http/headers', { params, paramsSerializer: { indexes: null } })

export const createHttpHeaders = (data) => request.post('/script/http/headers', data)

export const modifyHttpHeaders = (data) => request.put('/script/http/headers', data)

export const deleteHttpHeaders = (data) => request.delete('/script/http/headers', { data })

export const duplicateHttpheaderTemplate = (data) => request.post('/script/httpheader/template/duplicate', data)

export const copyHttpheaderTemplateToWorkspace = (data) =>
  request.post('/script/httpheader/template/copy/to/workspace', data)

export const moveHttpheaderTemplateToWorkspace = (data) =>
  request.post('/script/httpheader/template/move/to/workspace', data)

import request from '@/utils/request'

export const queryVariableDatasetList = (params) => request.get('/script/variable/dataset/list', { params: params })

export const queryVariableDatasetAll = (params) => request.get('/script/variable/dataset/all', { params: params })

export const queryVariableDatasetAllInPrivate = (params) =>
  request.get('/script/variable/dataset/all/in/private', { params: params })

export const createVariableDataset = (data) => request.post('/script/variable/dataset', data)

export const modifyVariableDataset = (data) => request.put('/script/variable/dataset', data)

export const deleteVariableDataset = (data) => request.delete('/script/variable/dataset', { data: data })

export const createVariable = (data) => request.post('/script/variable', data)

export const modifyVariable = (data) => request.put('/script/variable', data)

export const deleteVariable = (data) => request.delete('/script/variable', { data: data })

export const enableVariable = (data) => request.put('/script/variable/enable', data)

export const disableVariable = (data) => request.put('/script/variable/disable', data)

export const updateCurrentValue = (data) => request.put('/script/variable/current/value', data)

export const queryVariablesByDataset = (params) => request.get('/script/variables/by/dataset', { params: params })

export const queryVariables = (params) =>
  request.get('/script/variables', { params: params, paramsSerializer: { indexes: null } })

export const createVariables = (data) => request.post('/script/variables', data)

export const modifyVariables = (data) => request.put('/script/variables', data)

export const deleteVariables = (data) => request.delete('/script/variables', { data: data })

export const duplicateVariableDataset = (data) => request.post('/script/variable/dataset/duplicate', data)

export const copyVariableDatasetToWorkspace = (data) => request.post('/script/variable/dataset/copy/to/workspace', data)

export const moveVariableDatasetToWorkspace = (data) => request.post('/script/variable/dataset/move/to/workspace', data)

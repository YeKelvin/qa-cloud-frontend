import request from '@/utils/request'

export const queryDatabaseEngineList = (params) => request.get('/script/database/engine/list', { params })

export const queryDatabaseEngineAll = (params) => request.get('/script/database/engine/all', { params })

export const queryDatabaseEngineInfo = (params) => request.get('/script/database/engine', { params })

export const createDatabaseEngine = (data) => request.post('/script/database/engine', data)

export const modifyDatabaseEngine = (data) => request.put('/script/database/engine', data)

export const deleteDatabaseEngine = (data) => request.delete('/script/database/engine', { data })

export const duplicateDatabaseEngine = (data) => request.post('/script/database/engine/duplicate', data)

export const copyDatabaseEngineToWorkspace = (data) => request.post('/script/database/engine/copy/to/workspace', data)

export const moveDatabaseEngineToWorkspace = (data) => request.post('/script/database/engine/move/to/workspace', data)

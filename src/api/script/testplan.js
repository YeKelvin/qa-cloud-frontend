import request from '@/utils/request'

export const queryTestplanList = (params) => request.get('/script/testplan/list', { params: params })

export const queryTestplanAll = (params) =>
  request.get('/script/testplan/all', {
    params: params,
    paramsSerializer: { indexes: null }
  })

export const queryTestplan = (params) => request.get('/script/testplan', { params: params })

export const createTestplan = (data) => request.post('/script/testplan', data)

export const modifyTestplan = (data) => request.put('/script/testplan', data)

export const modifyTestplanState = (data) => request.put('/script/testplan/state', data)

export const modifyTestplanTestphase = (data) => request.put('/script/testplan/testphase', data)

export const queryTestplanExecutionAll = (params) => request.get('/script/testplan/execution/all', { params: params })

export const queryTestplanExecutionDetails = (params) =>
  request.get('/script/testplan/execution/details', { params: params })

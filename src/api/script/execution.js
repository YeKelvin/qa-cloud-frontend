import request from '@/utils/request'

export const executeCollection = (data) => request.post('/script/collection/execute', data)

export const executeWorker = (data) => request.post('/script/worker/execute', data)

export const executeSampler = (data) => request.post('/script/sampler/execute', data)

export const executeSnippets = (data) => request.post('/script/snippets/execute', data)

export const executeTestPlan = (data) => request.post('/script/testplan/execute', data)

export const interruptTestplan = (data) => request.post('/script/testplan/execution/interrupt', data)

export const queryCollectionJson = (params) =>
  request.get('/script/collection/json', {
    params: params,
    paramsSerializer: { indexes: null }
  })

export const queryWorkerJson = (params) =>
  request.get('/script/worker/json', {
    params: params,
    paramsSerializer: { indexes: null }
  })

export const querySnippetsJson = (params) =>
  request.get('/script/snippets/json', {
    params: params,
    paramsSerializer: { indexes: null }
  })

import request from '@/utils/request'

export const runCollection = (data) => request.post('/script/element/collection/run', data)

export const runWorker = (data) => request.post('/script/element/worker/run', data)

export const runSampler = (data) => request.post('/script/element/sampler/run', data)

export const runSnippet = (data) => request.post('/script/element/snippet/run', data)

export const runOffline = (data) => request.post('/script/element/offline/run', data)

export const executeTestPlan = (data) => request.post('/script/testplan/execute', data)

export const interruptTestplan = (data) => request.post('/script/testplan/interrupt', data)

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

export const querySnippetJson = (params) =>
  request.get('/script/snippet/json', {
    params: params,
    paramsSerializer: { indexes: null }
  })

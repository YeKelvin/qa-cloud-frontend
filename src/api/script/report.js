import request from '@/utils/request'

export const queryReport = (params) => request.get('/script/report', { params: params })

export const queryCollectionResult = (params) => request.get('/script/report/collection/result', { params: params })

export const queryWorkerResult = (params) => request.get('/script/report/worker/result', { params: params })

export const querySamplerResult = (params) => request.get('/script/report/sampler/result', { params: params })

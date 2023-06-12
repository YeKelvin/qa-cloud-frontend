import request from '@/utils/request'

export const queryApplicationList = (params) => request.get('/opencenter/application/list', { params: params })

export const queryApplicationInfo = (params) => request.get('/opencenter/application/info', { params: params })

export const createApplication = (data) => request.post('/opencenter/application', data)

export const modifyApplication = (data) => request.put('/opencenter/application', data)

export const modifyApplicationState = (data) => request.put('/opencenter/application/state', data)

export const resetApplicationSecret = (data) => request.post('/opencenter/application/secret/reset', data)

export const deleteApplication = (data) => request.delete('/opencenter/application', { data: data })

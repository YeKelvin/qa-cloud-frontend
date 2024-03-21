import request from '@/utils/request'

export const queryJobList = (params) => request.get('/schedule/job/list', { params: params })

export const queryJobInfo = (params) => request.get('/schedule/job/info', { params: params })

export const createJob = (data) => request.post('/schedule/job', data)

export const modifyJob = (data) => request.put('/schedule/job', data)

export const pauseJob = (data) => request.put('/schedule/job/pause', data)

export const resumeJob = (data) => request.put('/schedule/job/resume', data)

export const removeJob = (data) => request.put('/schedule/job/remove', data)

export const queryJobLogList = (params) => request.get('/schedule/job/log/list', { params: params })

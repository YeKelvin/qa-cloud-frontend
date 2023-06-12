import request from '@/utils/request'

export const queryGroupList = (params) => request.get('/usercenter/group/list', { params: params })

export const queryGroupAll = () => request.get('/usercenter/group/all')

export const queryGroupInfo = (params) => request.get('/usercenter/group/info', { params: params })

export const createGroup = (data) => request.post('/usercenter/group', data)

export const modifyGroup = (data) => request.put('/usercenter/group', data)

export const modifyGroupState = (data) => request.put('/usercenter/group/state', data)

export const deleteGroup = (data) => request.delete('/usercenter/group', { data: data })

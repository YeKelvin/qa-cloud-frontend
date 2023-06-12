import request from '@/utils/request'

export const login = (data) => request.post('/usercenter/user/login', data)

export const logout = (data) => request.post('/usercenter/user/logout', data)

export const queryInfo = () => request.get('/usercenter/user/info')

export const modifyUserInfo = (data) => request.put('/usercenter/user/info', data)

export const modifyUserSettings = (data) => request.put('/usercenter/user/settings', data)

export const modifyUserPassword = (data) => request.put('/usercenter/user/password', data)

export const register = (data) => request.post('/usercenter/user/register', data)

export const resetPassword = (data) => request.put('/usercenter/user/password/reset', data)

export const queryUserList = (params) => request.get('/usercenter/user/list', { params: params })

export const queryUserAll = () => request.get('/usercenter/user/all')

export const modifyUser = (data) => request.put('/usercenter/user', data)

export const modifyUserState = (data) => request.put('/usercenter/user/state', data)

export const deleteUser = (data) => request.delete('/usercenter/user', { data: data })

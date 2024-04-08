import request from '@/utils/request'

export const queryTokenAll = (params) => request.get('/opencenter/token/all', { params: params })

export const queryToken = (params) => request.get('/opencenter/token', { params: params })

export const createAppToken = (data) => request.post('/opencenter/app/token', data)

export const createUserToken = (data) => request.post('/opencenter/user/token', data)

export const modifyToken = (data) => request.put('/opencenter/token', data)

export const removeToken = (data) => request.delete('/opencenter/token', { data: data })

import request from '@/utils/request'

export const queryNoticeRobotList = (params) => request.get('/public/notice/robot/list', { params: params })

export const queryNoticeRobotAll = (params) => request.get('/public/notice/robot/all', { params: params })

export const queryNoticeRobot = (params) => request.get('/public/notice/robot', { params: params })

export const createNoticeRobot = (data) => request.post('/public/notice/robot', data)

export const modifyNoticeRobot = (data) => request.put('/public/notice/robot', data)

export const modifyNoticeRobotState = (data) => request.put('/public/notice/robot/state', data)

export const removeNoticeRobot = (data) => request.delete('/public/notice/robot', { data: data })

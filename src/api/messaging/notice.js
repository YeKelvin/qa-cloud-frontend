import request from '@/utils/request'

export const queryNoticeBotList = (params) => request.get('/messaging/notice/bot/list', { params: params })

export const queryNoticeBotAll = (params) => request.get('/messaging/notice/bot/all', { params: params })

export const queryNoticeBot = (params) => request.get('/messaging/notice/bot', { params: params })

export const createNoticeBot = (data) => request.post('/messaging/notice/bot', data)

export const modifyNoticeBot = (data) => request.put('/messaging/notice/bot', data)

export const modifyNoticeBotState = (data) => request.put('/messaging/notice/bot/state', data)

export const removeNoticeBot = (data) => request.delete('/messaging/notice/bot', { data: data })

export const queryNoticeLogList = (params) => request.get('/messaging/notice/log/list', { params: params })

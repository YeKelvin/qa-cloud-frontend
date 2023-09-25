import request from '@/utils/request'

export const queryDataLogList = (params) => request.get('/system/data/log', { params: params })

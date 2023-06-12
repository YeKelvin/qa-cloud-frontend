import request from '@/utils/request'

export const queryRestAPILogList = (params) => request.get('/system/restapi/log/list', { params: params })

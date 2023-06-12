import request from '@/utils/request'

export const queryOpenAPILogList = (params) => request.get('/opencenter/openapi/log/list', { params: params })

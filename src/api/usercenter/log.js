import request from '@/utils/request'

export const queryLoginLogList = (params) => request.get('/usercenter/login/log/list', { params: params })

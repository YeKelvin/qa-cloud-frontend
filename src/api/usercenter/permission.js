import request from '@/utils/request'

export const queryPermissionAll = (params) =>
  request.get('/usercenter/permission/all', {
    params: params,
    paramsSerializer: { indexes: null }
  })

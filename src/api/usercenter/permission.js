import request from '@/utils/request'

export const queryPermissionAll = (params) =>
  request.get('/usercenter/permission/all', {
    params: params,
    paramsSerializer: { indexes: null }
  })

export const queryOpenPermissionAll = (params) => request.get('/usercenter/open/permission/all', { params: params })

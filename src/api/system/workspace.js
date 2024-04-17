import request from '@/utils/request'

export const queryWorkspaceList = (params) => request.get('/system/workspace/list', { params: params })

export const queryWorkspaceAll = (params) =>
  request.get('/system/workspace/all', {
    params,
    paramsSerializer: { indexes: null }
  })

export const queryWorkspaceInfo = (params) => request.get('/system/workspace/info', { params: params })

export const createWorkspace = (data) => request.post('/system/workspace', data)

export const modifyWorkspace = (data) => request.put('/system/workspace', data)

export const deleteWorkspace = (data) => request.delete('/system/workspace', { data: data })

export const queryWorkspaceMemberAll = (params) => request.get('/system/workspace/member/all', { params: params })

export const modifyWorkspaceMember = (data) => request.put('/system/workspace/member', data)

export const queryWorkspaceRestriction = (params) => request.get('/system/workspace/restriction', { params: params })

export const setWorkspaceRestriction = (data) => request.post('/system/workspace/restriction', data)

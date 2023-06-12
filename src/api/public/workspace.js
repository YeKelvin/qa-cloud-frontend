import request from '@/utils/request'

export const queryWorkspaceList = params => request.get('/public/workspace/list', { params: params })

export const queryWorkspaceAll = params => request.get('/public/workspace/all', { params: params })

export const queryWorkspaceInfo = params => request.get('/public/workspace/info', { params: params })

export const createWorkspace = data => request.post('/public/workspace', data)

export const modifyWorkspace = data => request.put('/public/workspace', data)

export const deleteWorkspace = data => request.delete('/public/workspace', { data: data })

export const queryWorkspaceMemberAll = params => request.get('/public/workspace/member/all', { params: params })

export const modifyWorkspaceMember = data => request.put('/public/workspace/member', data)

export const queryWorkspaceRestriction = params => request.get('/public/workspace/restriction', { params: params })

export const setWorkspaceRestriction = data => request.post('/public/workspace/restriction', data)

import request from '@/utils/request'

export const encryptionFactor = (params) => request.get('/usercenter/encryption/factor', { params: params })

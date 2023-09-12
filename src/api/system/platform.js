import request from '@/utils/request'

export const queryPlatformConfigs = (params) => request.get('/system/platform/configs')

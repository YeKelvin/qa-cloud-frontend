import request from '@/utils/request'

export const queryElementChangelogList = (params) => request.get('/script/element/changelog/list', { params })

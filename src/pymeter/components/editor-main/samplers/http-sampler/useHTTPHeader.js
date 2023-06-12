import { isEmpty as _isEmpty } from 'lodash-es'
import { isBlank } from '@/utils/string-util'

export default function useHTTPHeader() {
  const headerItems = ref([])
  const headerData = computed(() => {
    if (_isEmpty(headerItems.value)) return null
    const data = []
    headerItems.value.forEach((item) => {
      if (isBlank(item.name)) return
      data.push({
        class: 'HTTPHeader',
        enabled: item.enabled,
        property: {
          Header__name: item.name,
          Header__value: item.value
        }
      })
    })
    if (_isEmpty(data)) return null
    return {
      class: 'HTTPHeaderManager',
      property: {
        HeaderManager__headers: data
      }
    }
  })

  /**
   * 设置 content-type
   */
  const setContentType = (val) => {
    const header = headerItems.value.find((item) => item.name.toLowerCase() === 'content-type')
    if (header) {
      header.value = val
    } else {
      headerItems.value.push({ enabled: true, name: 'content-type', value: val })
    }
  }

  const getContentType = () => {
    const header = headerItems.value.find((item) => item.name.toLowerCase() === 'content-type')
    if (header) {
      return header.value
    } else {
      return ''
    }
  }

  const removeContentType = () => {
    const index = headerItems.value.findIndex((item) => item.name.toLowerCase() === 'content-type')
    headerItems.value.splice(index, 1)
  }

  return {
    headerItems,
    headerData,
    setContentType,
    getContentType,
    removeContentType
  }
}

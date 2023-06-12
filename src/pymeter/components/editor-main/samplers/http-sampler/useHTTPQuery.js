import { isEmpty as _isEmpty } from 'lodash-es'
import { isBlank } from '@/utils/string-util'

export default function useHTTPQuery() {
  const queryItems = ref([])

  const queryData = computed(() => {
    if (_isEmpty(queryItems.value)) return null
    const data = []
    queryItems.value.forEach((item) => {
      if (isBlank(item.name)) return
      data.push({
        class: 'Argument',
        enabled: item.enabled,
        property: {
          Argument__name: item.name,
          Argument__value: item.value,
          Argument__desc: item.desc
        }
      })
    })
    if (_isEmpty(data)) return null
    return {
      class: 'Arguments',
      property: {
        Arguments__arguments: data
      }
    }
  })

  return {
    queryItems,
    queryData
  }
}

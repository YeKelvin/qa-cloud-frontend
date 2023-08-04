import { isEmpty as _isEmpty } from 'lodash-es'
import { isBlank } from '@/utils/string-util'

export default function useHTTPBody() {
  const bodyCode = ref('')
  const bodyMode = ref('none')
  const bodyRawType = ref('json')
  const bodyRawTypeEnum = reactive({
    json: 'application/json',
    xml: 'application/xml',
    text: 'text/plain'
  })
  const bodyData = computed(() => {
    if (bodyMode.value === 'raw' || bodyMode.value === 'custom') {
      return bodyCode.value
    }
    if (bodyMode.value === 'form-data') {
      return fileParameters.value
    }
    if (bodyMode.value === 'x-www-form-urlencoded') {
      return formParameters.value
    }
    if (bodyMode.value === 'none') {
      return null
    }
    return ''
  })

  const fileItems = ref([])
  const fileParameters = computed(() => {
    if (_isEmpty(fileItems.value) || bodyMode.value !== 'form-data') return null
    const parameters = []
    fileItems.value.forEach((item) => {
      if (isBlank(item.name)) return
      parameters.push({
        class: 'HTTPFileArgument',
        enabled: item.enabled,
        property: {
          Argument__name: item.name,
          Argument__value: item.value,
          Argument__argtype: item.argtype,
          Argument__mimetype: item.mimetype,
          Argument__desc: item.desc
        }
      })
    })
    if (_isEmpty(parameters)) return null
    return {
      class: 'Arguments',
      property: {
        Arguments__arguments: parameters
      }
    }
  })

  const formItems = ref([])
  const formParameters = computed(() => {
    if (_isEmpty(formItems.value) || bodyMode.value !== 'x-www-form-urlencoded') return null
    const parameters = []
    formItems.value.forEach((item) => {
      if (isBlank(item.name)) return
      parameters.push({
        class: 'Argument',
        enabled: item.enabled,
        property: {
          Argument__name: item.name,
          Argument__value: item.value,
          Argument__desc: item.desc
        }
      })
    })
    if (_isEmpty(parameters)) return null
    return {
      class: 'Arguments',
      property: {
        Arguments__arguments: parameters
      }
    }
  })

  /**
   * 设置 bodyMode
   */
  const setBodyMode = (contentType) => {
    if (!contentType || contentType === '') {
      bodyMode.value = 'none'
      return
    }
    if (contentType.indexOf('multipart/form-data') > -1) {
      bodyMode.value = 'form-data'
      return
    }
    if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
      bodyMode.value = 'x-www-form-urlencoded'
      return
    }
    if (contentType.indexOf('application/json') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'json'
      return
    }
    if (contentType.indexOf('application/xml') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'xml'
      return
    }
    if (contentType.indexOf('text/plain') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'text'
      return
    }
    bodyMode.value = 'cutom'
  }

  return {
    bodyCode,
    bodyMode,
    bodyRawType,
    bodyRawTypeEnum,
    bodyData,
    formItems,
    formParameters,
    fileItems,
    fileParameters,
    setBodyMode
  }
}

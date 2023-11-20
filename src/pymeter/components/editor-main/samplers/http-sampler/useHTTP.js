import { isEmpty } from 'lodash-es'

// 运行策略的逻辑条件数据
const filterConditionData = [
  {
    field: { label: '类型', value: 'TYPE' },
    options: [
      { label: '前置', value: 'PREV' },
      { label: '后置', value: 'POST' },
      { label: '断言', value: 'ASSERT' }
    ]
  },
  {
    field: { label: '层级', value: 'LEVEL' },
    options: [
      { label: '空间', value: '0' },
      { label: '集合', value: '1' },
      { label: '线程', value: '2' },
      { label: '控制器', value: '3' },
      { label: '取样器', value: '4' }
    ]
  }
]

export default function useHTTP(elementData) {
  const bodyMode = ref('none')
  const bodyRawType = ref('json')
  const bodyRawTypeEnums = {
    json: 'application/json',
    xml: 'application/xml',
    text: 'text/plain'
  }

  /**
   * 设置 BodyMode
   */
  const setBodyMode = () => {
    const contenttype = getContentType()
    if (!contenttype || contenttype === '') {
      bodyMode.value = 'none'
      return
    }
    if (contenttype.indexOf('multipart/form-data') > -1) {
      bodyMode.value = 'form-data'
      return
    }
    if (contenttype.indexOf('application/x-www-form-urlencoded') > -1) {
      bodyMode.value = 'x-www-form-urlencoded'
      return
    }
    if (contenttype.indexOf('application/json') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'json'
      return
    }
    if (contenttype.indexOf('application/xml') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'xml'
      return
    }
    if (contenttype.indexOf('text/plain') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'text'
      return
    }
    bodyMode.value = 'cutom'
  }

  /**
   * 设置 Content-Type
   */
  const setContentType = (val) => {
    const header = elementData.value.elementAttrs.HTTPSampler__headers.find(
      (item) => item.name.toLowerCase() === 'content-type'
    )
    if (header) {
      header.value = val
    } else {
      elementData.value.elementAttrs.HTTPSampler__headers.push({ enabled: true, name: 'content-type', value: val })
      elementData.value.elementAttrs.HTTPSampler__headers = elementData.value.elementAttrs.HTTPSampler__headers.filter(
        (row) => !isEmpty(row.name) || !isEmpty(row.value) || !isEmpty(row.desc)
      )
    }
  }

  /**
   * 获取Content-Type
   */
  const getContentType = () => {
    const header = elementData.value.elementAttrs.HTTPSampler__headers.find(
      (item) => item.name.toLowerCase() === 'content-type'
    )
    if (header) {
      return header.value
    } else {
      return ''
    }
  }

  /**
   * 移除Content-Type
   */
  const removeContentType = () => {
    const index = elementData.value.elementAttrs.HTTPSampler__headers.findIndex(
      (item) => item.name.toLowerCase() === 'content-type'
    )
    elementData.value.elementAttrs.HTTPSampler__headers.splice(index, 1)
  }

  /**
   * 校验运行策略
   */
  const checkRunningStrategy = () => {
    return checkFilter(elementData.value.elementProps.HTTPSampler__running_strategy.filter)
  }

  /**
   * 校验逻辑条件
   */
  const checkFilter = (filterRule) => {
    let error = false
    // 过滤空白的逻辑条件
    if (isEmpty(filterRule)) return
    if ('logic' in filterRule) {
      error = checkLogicalCondition(filterRule)
    } else {
      if ('field' in filterRule && isEmpty(filterRule.field)) {
        error = true
      }
    }
    return error
  }

  /**
   * 校验条件的关键字是否为空
   */
  const checkLogicalCondition = (grouprule) => {
    const rules = grouprule.rules
    for (let i = 0; i < rules.length; i++) {
      if ('logic' in rules[i]) {
        if (checkLogicalCondition(rules[i])) return true
      } else {
        if (isEmpty(rules[i].field)) return true
      }
    }
  }

  /** ****************************** hidden-dots ****************************** **/
  const hiddenHTTPBodyDot = computed(() => {
    const mode = bodyMode.value
    if ((mode === 'raw' || mode === 'custom') && isEmpty(elementData.value.elementProps.HTTPSampler__data)) return true
    if (mode === 'form-data') {
      const files = elementData.value.elementAttrs.HTTPSampler__files
      if (files.length === 0) return true
      if (files.length === 1) {
        const item = files[0]
        if (isEmpty(item.name) && isEmpty(item.value) && isEmpty(item.desc)) return true
      }
    }
    if (mode === 'x-www-form-urlencoded') {
      const forms = elementData.value.elementAttrs.HTTPSampler__forms
      if (forms.length === 0) return true
      if (forms.length === 1) {
        const item = forms[0]
        if (isEmpty(item.name) && isEmpty(item.value) && isEmpty(item.desc)) return true
      }
    }
    if (mode === 'none') return true
    return false
  })
  const hiddenHTTPQuerysDot = computed(() => {
    const querys = elementData.value.elementAttrs.HTTPSampler__querys
    if (querys.length === 0) {
      return true
    }
    if (querys.length === 1) {
      const item = querys[0]
      if (isEmpty(item.name) && isEmpty(item.value) && isEmpty(item.desc)) return true
    }
    return false
  })
  const hiddenHTTPHeadersDot = computed(() => {
    const headers = elementData.value.elementAttrs.HTTPSampler__headers
    const refs = elementData.value.elementAttrs.HTTPSampler__header_template_refs
    if (headers.length === 0) {
      return isEmpty(refs)
    }
    if (headers.length === 1) {
      const item = headers[0]
      if (isEmpty(item.name) && isEmpty(item.value)) {
        return isEmpty(refs)
      }
    }
    return false
  })
  const hiddenHTTPConfigsDot = computed(
    () =>
      isEmpty(elementData.value.elementProps.HTTPSampler__encoding) &&
      isEmpty(elementData.value.elementProps.HTTPSampler__connect_timeout) &&
      isEmpty(elementData.value.elementProps.HTTPSampler__response_timeout) &&
      elementData.value.elementProps.HTTPSampler__follow_redirects === 'false'
  )
  const hiddenCompoSettingsDot = computed(
    () =>
      isEmpty(elementData.value.elementProps.HTTPSampler__running_strategy.filter) &&
      isEmpty(elementData.value.elementProps.HTTPSampler__running_strategy.reverse)
  )

  /** ****************************** hooks ****************************** **/
  watch(bodyMode, () => {
    if (bodyMode.value === 'none' || bodyMode.value === 'custom') {
      removeContentType()
      return
    }
    if (bodyMode.value === 'form-data') {
      setContentType('multipart/form-data')
      return
    }
    if (bodyMode.value === 'x-www-form-urlencoded') {
      setContentType('application/x-www-form-urlencoded')
      return
    }
    if (bodyMode.value === 'raw') {
      setContentType(bodyRawTypeEnums[bodyRawType.value])
      return
    }
  })
  watch(bodyRawType, () => {
    setContentType(bodyRawTypeEnums[bodyRawType.value])
  })

  return {
    bodyMode,
    bodyRawType,
    bodyRawTypeEnums,
    filterConditionData,
    hiddenHTTPBodyDot,
    hiddenHTTPQuerysDot,
    hiddenHTTPHeadersDot,
    hiddenHTTPConfigsDot,
    hiddenCompoSettingsDot,
    setBodyMode,
    setContentType,
    getContentType,
    removeContentType,
    checkRunningStrategy
  }
}

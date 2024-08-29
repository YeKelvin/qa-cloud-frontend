import { isArray as _isArray, isObject as _isObject } from 'lodash-es'

export default function useEditor() {
  const isObject = obj => {
    return !_isArray(obj) && _isObject(obj)
  }

  const deepAssign = (target, source) => {
    for (const key of Object.keys(source)) {
      const value = source[key]
      if (key in target && (value === undefined || value === null)) continue
      if (isObject(value)) {
        deepAssign(target[key], value)
      } else {
        target[key] = value
      }
    }
  }

  /**
   * 合并元素
   */
  const assignElement = (target, source) => {
    target.elementNo = source.elementNo
    target.elementName = source.elementName
    target.elementDesc = source.elementDesc
    target.elementType = source.elementType
    target.elementClass = source.elementClass
    if ('elementAttrs' in target) {
      deepAssign(target.elementAttrs, source.elementAttrs)
    }
    if ('elementProps' in target) {
      deepAssign(target.elementProps, source.elementProps)
    }
  }

  const assignMetadata = (target, source) => {
    deepAssign(target, source)
  }

  const assignComponent = (target, source) => {
    if ('elementCompos' in target) {
      Object.assign(target.elementCompos, source)
    }
  }

  const assignConfig = (target, source) => {
    Object.assign(target, source)
  }

  return {
    assignConfig,
    assignElement,
    assignMetadata,
    assignComponent
  }
}

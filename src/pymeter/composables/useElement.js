export default function useEditor(props) {
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
      Object.assign(target.elementAttrs, source.elementAttrs)
    }
    if ('elementProps' in target) {
      Object.assign(target.elementProps, source.elementProps)
    }
  }

  const assignComponent = (target, source) => {
    if ('elementCompos' in target) {
      Object.assign(target.elementCompos, source)
    }
  }

  return {
    assignElement,
    assignComponent
  }
}

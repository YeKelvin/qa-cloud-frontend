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
    Object.assign(target.property, source.property)
    if ('elementAttrs' in target) {
      Object.assign(target.elementAttrs, source.elementAttrs)
    }
  }

  return {
    assignElement
  }
}

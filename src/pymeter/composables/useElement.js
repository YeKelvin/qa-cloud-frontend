export default function useEditor(props) {
  /**
   * 合并元素
   */
  const assignElement = (target, source) => {
    target.elementNo = source.elementNo
    target.elementName = source.elementName
    target.elementRemark = source.elementRemark
    target.elementType = source.elementType
    target.elementClass = source.elementClass
    Object.assign(target.property, source.property)
    if ('attributes' in target) {
      Object.assign(target.attributes, source.attributes)
    }
  }

  return {
    assignElement
  }
}

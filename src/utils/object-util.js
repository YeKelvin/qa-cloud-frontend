/**
 * 生成对象的hashcode
 */
export const toHashCode = (obj) => {
  const jsonString = JSON.stringify(obj)
  if (!jsonString) return
  let hash = 0
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // 将hash转换为32位整数
  }
  return hash
}

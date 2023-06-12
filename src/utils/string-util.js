export function isEmpty(val) {
  if (val === undefined || val === null || val === '' || val.length === 0) {
    return true
  }
  return false
}

export function isNotEmpty(val) {
  return !isEmpty(val)
}

export function isBlank(val) {
  if (isEmpty(val) || val.replace(/(^s*)|(s*$)/g, '').length === 0) {
    return true
  }
  return false
}

export function isNotBlank(val) {
  return !isBlank(val)
}

export function isBlankAll(...args) {
  let blank = true
  args.forEach((val) => {
    if (!isBlank(val)) blank = false
  })
  return blank
}

export function isNotBlankAll(...args) {
  let blank = true
  args.forEach((val) => {
    if (!isNotBlank(val)) blank = false
  })
  return blank
}

export function toBoolean(val) {
  return String(val).toLowerCase() === 'true'
}

export function trim(val) {
  return val.replace(/(^\s*)|(\s*$)/g, '')
}

export function ltrim(val) {
  return val.replace(/(^\s*)/g, '')
}

export function rtrim(val) {
  return val.replace(/(\s*$)/g, '')
}

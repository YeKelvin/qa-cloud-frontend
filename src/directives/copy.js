import { ElMessage } from 'element-plus'

function handleClick(ev) {
  const input = document.createElement('input')
  input.value = this.copyData.toLocaleString()
  document.body.appendChild(input)
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
  ElMessage({
    type: 'success',
    message: '复制成功'
  })
}

export default {
  mounted(el, binding) {
    el.copyData = binding.value
    el.addEventListener('click', handleClick)
  },
  updated(el, binding) {
    el.copyData = binding.value
  },
  beforeUnmount(el) {
    el.removeEventListener('click', el.__handleClick__)
  }
}

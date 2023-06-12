import { ElMessage } from 'element-plus'

export default function useElForm() {
  /**
   * 表单校验
   */
  const validate = async (form) => {
    const pass = await form
      .validate()
      .then(() => true)
      .catch(() => false)
    if (!pass) {
      ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    }
    return pass
  }
}

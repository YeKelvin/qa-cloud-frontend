import { useRouter } from 'vue-router'

export default function useNavigation() {
  const router = useRouter()

  /**
   * 返回上一页
   */
  const goBack = (defaultTo) => {
    window.history.length > 1 ? router.go(-1) : router.push(defaultTo)
  }
}

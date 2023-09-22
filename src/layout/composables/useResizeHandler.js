import { useAppStore } from '@/store/app'

const { body } = document
const WIDTH = 992 // refer to Bootstrap's responsive design

export default function useResizeHandler() {
  const appStore = useAppStore()

  const $_isMobile = () => {
    const rect = body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }

  const $_resizeHandler = () => {
    if (!document.hidden) {
      const isMobile = $_isMobile()
      appStore.toggleDevice(isMobile ? 'mobile' : 'desktop')

      if (isMobile) {
        appStore.closeSideBar({ withoutAnimation: true })
      }
    }
  }

  onBeforeMount(() => {
    window.addEventListener('resize', $_resizeHandler)
  })

  onMounted(() => {
    const isMobile = $_isMobile()
    if (isMobile) {
      appStore.toggleDevice('mobile')
      appStore.closeSideBar({ withoutAnimation: true })
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', $_resizeHandler)
  })
}

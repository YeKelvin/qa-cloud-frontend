export default function useOS() {
  const isMacOS = computed(() => /macintosh|mac os x/i.test(navigator.userAgent))

  const isWindows = computed(() => /windows|win64|win32/i.test(navigator.userAgent))

  return {
    isMacOS,
    isWindows
  }
}

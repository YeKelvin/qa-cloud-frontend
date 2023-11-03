export default function useOS() {
  const isMacOS = () => /macintosh|mac os x/i.test(navigator.userAgent)

  const isWindows = () => /windows|win64|win32/i.test(navigator.userAgent)

  return {
    isMacOS,
    isWindows
  }
}

import { inject } from 'vue'

export default function useSocket() {
  const socket = inject('socket')
  return socket
}

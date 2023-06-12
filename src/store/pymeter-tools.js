/**
 * 移除 keepalive 缓存
 */
export function removeCache(keepAlive, cacheKey) {
  const keepAliveComponent = keepAlive.$
  const cacheMap = keepAliveComponent.__v_cache
  const cachedVnode = cacheMap.get(cacheKey)
  if (cachedVnode) {
    const COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8
    const COMPONENT_KEPT_ALIVE = 1 << 9
    let shapeFlag = cachedVnode.shapeFlag
    if (shapeFlag & COMPONENT_SHOULD_KEEP_ALIVE) {
      shapeFlag -= COMPONENT_SHOULD_KEEP_ALIVE
    }
    if (shapeFlag & COMPONENT_KEPT_ALIVE) {
      shapeFlag -= COMPONENT_KEPT_ALIVE
    }
    cachedVnode.shapeFlag = shapeFlag
    const keepAliveRenderer = keepAliveComponent.proxy.renderer
    keepAliveRenderer.um(cachedVnode, keepAliveComponent, keepAliveComponent.suspense, false, false)
    cacheMap.delete(cacheKey)
  }
}

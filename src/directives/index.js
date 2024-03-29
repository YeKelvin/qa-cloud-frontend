import clickoutside from './clickoutside'
import copy from './copy'
import debounce from './debounce'
import longpress from './longpress'
import permission from './permission'
import watermark from './watermark'
import waves from './waves/waves'

export default function (app) {
  app.directive('permission', permission)
  app.directive('copy', copy)
  app.directive('longpress', longpress)
  app.directive('debounce', debounce)
  app.directive('watermark', watermark)
  app.directive('waves', waves)
  app.directive('clickoutside', clickoutside)
}

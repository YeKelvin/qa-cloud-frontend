// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口
// eslint-disable-next-line import/order
import * as echarts from 'echarts/core'
// 引入图表，图表后缀都为 Chart
import { PieChart } from 'echarts/charts'
// 引入组件，组件后缀都为 Component
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
// 引入特性
import { LabelLayout, UniversalTransition } from 'echarts/features'
// 引入渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { SVGRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  // 组件
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  // 图表
  PieChart,
  // 特性
  LabelLayout,
  UniversalTransition,
  // 渲染器
  SVGRenderer
])

export default function useECharts() {
  return {
    echarts
  }
}

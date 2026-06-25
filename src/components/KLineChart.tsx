import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { KLineItem } from '@/types'

export default function KLineChart({
  data,
  loading
}: {
  data: KLineItem[]
  loading: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const initRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    if (!initRef.current) {
      initRef.current = true
      const instance = echarts.init(containerRef.current)
      chartRef.current = instance

      const ro = new ResizeObserver(() => instance.resize())
      ro.observe(containerRef.current)

      // 首次渲染：dataZoom 指定 start/end 初始为全量
      instance.setOption(buildOption(data))

      return () => {
        ro.disconnect()
        instance.dispose()
        chartRef.current = null
        initRef.current = false
      }
    }

    // 仅在数据引用变化且非首次时更新；不传 start/end 以保留用户缩放
    const inst = chartRef.current
    if (inst) {
      inst.setOption(buildOption(data), { notMerge: false })
    }
  }, [data])

  if (loading && data.length === 0) {
    return <div className="loading">加载K线数据…</div>
  }
  if (data.length === 0) {
    return <div className="loading">无K线数据</div>
  }

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}

function buildOption(data: KLineItem[]) {
  const up = '#ef4444'
  const down = '#22c55e'
  const axisLabel = { color: '#8a909c' }
  const splitLine = { lineStyle: { color: '#2a2f3a' } }
  const categories = data.map((d) => d.time)

  return {
    backgroundColor: 'transparent',
    animation: false,
    tooltip: {
      trigger: 'axis',
      triggerOn: 'click',
      axisPointer: { type: 'cross' },
      valueFormatter: (v: number) => (v == null ? '-' : v.toFixed(2))
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      triggerOn: 'click'
    },
    grid: [
      { left: 60, right: 30, top: '4%', bottom: '22%' },
      { left: 60, right: 30, bottom: '4%', height: '14%' }
    ],
    xAxis: [
      {
        type: 'category',
        data: categories,
        scale: true,
        boundaryGap: false,
        splitLine: { show: false },
        axisLabel
      },
      {
        type: 'category',
        gridIndex: 1,
        data: categories,
        scale: true,
        boundaryGap: false,
        splitLine: { show: false },
        axisLabel: { show: false }
      }
    ],
    yAxis: [
      { scale: true, splitLine, axisLabel },
      { gridIndex: 1, scale: true, splitNumber: 2, splitLine, axisLabel }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false
      }
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: data.map((d) => [d.open, d.close, d.low, d.high]),
        itemStyle: {
          color: up,
          color0: down,
          borderColor: up,
          borderColor0: down
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.map((d) => d.volume),
        itemStyle: { color: '#4a5060' }
      }
    ]
  }
}

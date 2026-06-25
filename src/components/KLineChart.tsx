import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { KLineItem } from '@/types'

export default function KLineChart({
  data,
  loading
}: {
  data: KLineItem[]
  loading: boolean
}) {
  const option = useMemo(() => buildOption(data), [data])

  if (loading && data.length === 0) {
    return <div className="loading">加载K线数据…</div>
  }
  if (data.length === 0) {
    return <div className="loading">无K线数据</div>
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      notMerge
    />
  )
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
      axisPointer: { type: 'cross' },
      valueFormatter: (v: number) => (v == null ? '-' : v.toFixed(2))
    },
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    grid: [
      { left: 60, right: 30, top: 16, height: '60%' },
      { left: 60, right: 30, top: '76%', height: '16%' }
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
        start: 60,
        end: 100
      },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        start: 60,
        end: 100,
        height: 18,
        bottom: 6,
        borderColor: 'transparent',
        fillerColor: 'rgba(240,185,11,0.15)',
        textStyle: { color: '#8a909c' }
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

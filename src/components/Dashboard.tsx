import type { RealtimeQuote } from '@/types'

export default function Dashboard({
  quote,
  loading
}: {
  quote: RealtimeQuote | null
  loading: boolean
}) {
  if (!quote) {
    return (
      <div className="dashboard">
        <div className="loading">{loading ? '加载中…' : '暂无数据'}</div>
      </div>
    )
  }
  const up = quote.change >= 0
  const fmt = (n: number) => n.toFixed(2)
  return (
    <div className="dashboard">
      <div className="dash-title">
        <span>{quote.name}</span>
        <span>{new Date(quote.timestamp).toLocaleString('zh-CN')}</span>
      </div>
      <div className="price-row">
        <span className="price">{fmt(quote.price)}</span>
        <span className="price-unit">
          {quote.currency}/{quote.unit}
        </span>
      </div>
      <div className={`change ${up ? 'up' : 'down'}`}>
        {up ? '+' : ''}
        {fmt(quote.change)} ({up ? '+' : ''}
        {fmt(quote.changePercent)}%)
      </div>
      <div className="grid-stats">
        <Stat label="开盘" value={fmt(quote.open)} />
        <Stat label="最高" value={fmt(quote.high)} />
        <Stat label="最低" value={fmt(quote.low)} />
        <Stat label="昨收" value={fmt(quote.prevClose)} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}

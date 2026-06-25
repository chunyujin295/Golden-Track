import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import KLineChart from './components/KLineChart'
import BrandTable from './components/BrandTable'
import { usePriceFeed } from './hooks/usePriceFeed'
import type { KLinePeriod, SymbolKey } from './types'

const PERIOD_LABEL: Record<KLinePeriod, string> = {
  '1d': '日K',
  '1w': '周K',
  '1m': '月K'
}

export default function App() {
  const [symbol, setSymbol] = useState<SymbolKey>('AU')
  const [period, setPeriod] = useState<KLinePeriod>('1d')
  const { realtime, auBenchmark, history, brands, loading } = usePriceFeed(
    symbol,
    period
  )

  return (
    <div className="app">
      <Header symbol={symbol} onSymbol={setSymbol} loading={loading} />
      <div className="main">
        <Dashboard quote={realtime} loading={loading} />
        <div className="chart-panel">
          <div className="chart-toolbar">
            {(['1d', '1w', '1m'] as KLinePeriod[]).map((p) => (
              <button
                key={p}
                className={`period-btn ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
            <span className="muted" style={{ marginLeft: 'auto' }}>
              近1年
            </span>
          </div>
          <div className="chart-wrap">
            <KLineChart data={history} loading={loading} />
          </div>
        </div>
      </div>
      <div className="bottom">
        <BrandTable brands={brands} auBenchmark={auBenchmark} />
      </div>
    </div>
  )
}

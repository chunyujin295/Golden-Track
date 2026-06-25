import type { SymbolKey } from '@/types'

export default function Header({
  symbol,
  onSymbol,
  loading
}: {
  symbol: SymbolKey
  onSymbol: (s: SymbolKey) => void
  loading: boolean
}) {
  return (
    <div className="header">
      <div className="logo">◆ Golden Track</div>
      <div className="tabs">
        {(['AU', 'XAU'] as SymbolKey[]).map((s) => (
          <div
            key={s}
            className={`tab ${symbol === s ? 'active' : ''}`}
            onClick={() => onSymbol(s)}
          >
            {s === 'XAU' ? '伦敦金' : '沪金'}
          </div>
        ))}
      </div>
      <div className="status">
        <span className={`dot ${loading ? '' : 'live'}`}></span>
        <span>30s 自动刷新</span>
      </div>
    </div>
  )
}
